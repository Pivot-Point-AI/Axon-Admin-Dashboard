import type { HTTPValidationError } from "./types";

// The backend is only served over plain HTTP. Browsers block that as mixed
// content when the app itself is loaded over HTTPS (e.g. on Vercel), so in
// the browser we call it through the same-origin `/backend` proxy defined in
// next.config.ts, which forwards server-side to the real HTTP origin. Server
// components / SSR hit the backend directly since mixed-content rules don't
// apply outside the browser.
const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://20.205.184.153:5013";

export const API_BASE_URL =
  typeof window !== "undefined" ? "/backend" : BACKEND_ORIGIN;

// The Admin Dashboard API (auth/login, institutions, logs — all bearer-protected)
// is served under a separate /admin prefix on the same host.
export const ADMIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL?.replace(/\/$/, "") ??
  `${API_BASE_URL}/admin`;

// HTTPS tunnel to the same backend, used when the primary origin above is
// unreachable (e.g. the IP host is down/firewalled). It's HTTPS, so it can be
// called directly from the browser with no mixed-content proxying needed.
export const FALLBACK_ADMIN_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_FALLBACK_URL?.replace(/\/$/, "") ??
  "https://unaccused-shelby-unadept.ngrok-free.dev/admin";

export class ApiError extends Error {
  status: number;
  detail: HTTPValidationError | unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  bearerToken?: string | null;
  licenseKey?: string | null;
  baseUrl?: string;
  signal?: AbortSignal;
}

function buildUrl(
  path: string,
  query?: RequestOptions["query"],
  baseUrl: string = API_BASE_URL,
) {
  // baseUrl may be relative (the same-origin "/backend" proxy in the
  // browser), which the URL constructor can't parse without a base — build
  // the query string manually instead so both relative and absolute
  // baseUrls work.
  let url = `${baseUrl}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    if (qs) {
      url += (url.includes("?") ? "&" : "?") + qs;
    }
  }
  return url;
}

function extractErrorMessage(status: number, body: unknown): string {
  if (
    body &&
    typeof body === "object" &&
    "detail" in body &&
    Array.isArray((body as HTTPValidationError).detail)
  ) {
    return (body as HTTPValidationError).detail
      .map((d) => `${d.loc.join(".")}: ${d.msg}`)
      .join("; ");
  }
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
  }
  return `Request failed with status ${status}`;
}

async function performRequest<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(response.status, payload),
      response.status,
      payload,
    );
  }

  return payload as T;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    query,
    body,
    bearerToken,
    licenseKey,
    baseUrl = API_BASE_URL,
    signal,
  } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (bearerToken) {
    headers["Authorization"] = `Bearer ${bearerToken}`;
  }
  if (licenseKey) {
    headers["X-License-Key"] = licenseKey;
  }

  const init: RequestInit = {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  };

  const canFallBack =
    baseUrl === ADMIN_API_BASE_URL && baseUrl !== FALLBACK_ADMIN_BASE_URL;

  try {
    return await performRequest<T>(buildUrl(path, query, baseUrl), init);
  } catch (err) {
    // Retry against the ngrok fallback on a genuine network failure (server
    // down, connection refused, mixed-content block) or on a 404, which here
    // means the route hasn't been deployed to the primary origin yet even
    // though the server itself is reachable.
    const isNetworkFailure = err instanceof TypeError;
    const isNotFound = err instanceof ApiError && err.status === 404;
    if ((isNetworkFailure || isNotFound) && canFallBack) {
      return await performRequest<T>(
        buildUrl(path, query, FALLBACK_ADMIN_BASE_URL),
        init,
      );
    }
    throw err;
  }
}
