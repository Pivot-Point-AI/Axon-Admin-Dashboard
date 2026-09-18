import type { HTTPValidationError } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://20.205.184.153:5013";

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
}

function buildUrl(
  path: string,
  query?: RequestOptions["query"],
  baseUrl: string = API_BASE_URL,
) {
  const url = new URL(`${baseUrl}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
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
    baseUrl,
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

  const response = await fetch(buildUrl(path, query, baseUrl), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

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
