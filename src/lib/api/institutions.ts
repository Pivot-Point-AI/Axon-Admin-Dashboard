import { ADMIN_API_BASE_URL, apiRequest } from "./client";
import type {
  CreateInstitutionRequest,
  CreateInstitutionResponse,
  DeleteInstitutionResponse,
  InstitutionItem,
  RenewInstitutionLicenseRequest,
  UpdateInstitutionRequest,
} from "./types";

export function createInstitution(
  body: CreateInstitutionRequest,
  bearerToken: string,
) {
  return apiRequest<CreateInstitutionResponse>("/institutions/create", {
    method: "POST",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export async function getAllInstitutions(bearerToken: string, limit = 500) {
  const institutions = await apiRequest<InstitutionItem[] | null>(
    "/institutions",
    { query: { limit }, bearerToken, baseUrl: ADMIN_API_BASE_URL },
  );
  // The server can answer with null when there are no institutions.
  return Array.isArray(institutions) ? institutions : [];
}

export function getInstitutionById(institutionId: string, bearerToken: string) {
  return apiRequest<InstitutionItem>(
    `/institutions/${encodeURIComponent(institutionId)}`,
    { bearerToken, baseUrl: ADMIN_API_BASE_URL },
  );
}

export function updateInstitution(
  institutionId: string,
  body: UpdateInstitutionRequest,
  bearerToken: string,
) {
  return apiRequest<InstitutionItem>(
    `/institutions/${encodeURIComponent(institutionId)}`,
    { method: "PUT", body, bearerToken, baseUrl: ADMIN_API_BASE_URL },
  );
}

export function removeInstitution(institutionId: string, bearerToken: string) {
  return apiRequest<DeleteInstitutionResponse>(
    `/institutions/${encodeURIComponent(institutionId)}`,
    { method: "DELETE", bearerToken, baseUrl: ADMIN_API_BASE_URL },
  );
}

export function renewInstitutionLicense(
  institutionId: string,
  body: RenewInstitutionLicenseRequest,
  bearerToken: string,
) {
  return apiRequest<InstitutionItem>(
    `/institutions/${encodeURIComponent(institutionId)}/renew-license`,
    { method: "POST", body, bearerToken, baseUrl: ADMIN_API_BASE_URL },
  );
}
