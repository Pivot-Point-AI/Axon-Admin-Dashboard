import { ADMIN_API_BASE_URL, apiRequest } from "./client";
import type {
  LanguageModel,
  LanguageUpdateModel,
  PrimaryLanguageModel,
} from "./types";

// No response_model declared on the backend for GET /languages/ — treat the
// payload as unknown and render it defensively.
export function getLanguages(bearerToken: string) {
  return apiRequest<unknown>("/languages/", {
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function createLanguage(body: LanguageModel, bearerToken: string) {
  return apiRequest<unknown>("/languages/", {
    method: "POST",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function updateLanguage(
  languageCode: string,
  body: LanguageUpdateModel,
  bearerToken: string,
) {
  return apiRequest<unknown>(
    `/languages/${encodeURIComponent(languageCode)}`,
    { method: "PUT", body, bearerToken, baseUrl: ADMIN_API_BASE_URL },
  );
}

export function removeLanguage(languageCode: string, bearerToken: string) {
  return apiRequest<unknown>(
    `/languages/${encodeURIComponent(languageCode)}`,
    { method: "DELETE", bearerToken, baseUrl: ADMIN_API_BASE_URL },
  );
}

export function updatePrimaryLanguage(
  body: PrimaryLanguageModel,
  bearerToken: string,
) {
  return apiRequest<unknown>("/languages/primary", {
    method: "PUT",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}
