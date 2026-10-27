import { notify } from "@/lib/feedback";
import messages from "@/messages/en.json";
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
  successNotification?: "signedIn" | false;
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

export function getApiErrorMessage(status: number, body: unknown): string {
  const errors = messages.apiErrors;
  // Keep diagnostics on ApiError.detail, while giving users an actionable
  // message even if the server returns internal details or an HTML error page.
  if (status >= 500) {
    // The user-facing text is generic; keep the real cause findable.
    console.warn(`API responded ${status}`, body);
    return errors.serviceUnavailable;
  }
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
  switch (status) {
    case 401:
      return errors.signInRequired;
    case 403:
      return errors.permissionDenied;
    case 404:
      return errors.notFound;
    case 408:
      return errors.timeout;
    case 409:
      return errors.conflict;
    case 422:
      return errors.invalidDetails;
    case 429:
      return errors.tooManyRequests;
    default:
      return errors.unexpected;
  }
}

async function performRequest<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson
    ? await response.json().catch(() => {
        init.signal?.throwIfAborted();
        return null;
      })
    : null;

  if (!response.ok) {
    throw new ApiError(
      getApiErrorMessage(response.status, payload),
      response.status,
      payload,
    );
  }

  return payload as T;
}

// The /backend proxy occasionally answers 502/503/504 or drops the connection
// for a moment even though the API is up. A GET is safe to repeat, so retry
// once before telling the user something went wrong.
const TRANSIENT_STATUSES = new Set([502, 503, 504]);
const RETRY_DELAY_MS = 400;

async function requestWithRetry<T>(url: string, init: RequestInit): Promise<T> {
  if (init.method !== "GET") return performRequest<T>(url, init);
  try {
    return await performRequest<T>(url, init);
  } catch (error) {
    const transient =
      (error instanceof ApiError && TRANSIENT_STATUSES.has(error.status)) ||
      error instanceof TypeError;
    if (!transient || init.signal?.aborted) throw error;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    init.signal?.throwIfAborted();
    return performRequest<T>(url, init);
  }
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
    successNotification,
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
    signal:
      method === "GET"
        ? AbortSignal.any([
            ...(signal ? [signal] : []),
            AbortSignal.timeout(30_000),
          ])
        : signal,
    cache: method === "GET" ? "no-store" : undefined,
  };

  try {
    const url = buildUrl(path, query, baseUrl);
    const result = await requestWithRetry<T>(url, init);
    if (method !== "GET" && successNotification !== false) {
      notify({
        kind: "success",
        operation: method,
        messageKey: successNotification,
      });
    }
    return result;
  } catch (error) {
    const requestError =
      init.signal?.reason instanceof DOMException &&
      init.signal.reason.name === "TimeoutError"
        ? new ApiError(getApiErrorMessage(408, null), 408)
        : error;
    if (!(
      requestError instanceof DOMException && requestError.name === "AbortError"
    )) {
      notify({
        kind: "error",
        message:
          requestError instanceof ApiError ? requestError.message : undefined,
      });
    }
    throw requestError;
  }
}
