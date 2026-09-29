import { ADMIN_API_BASE_URL, apiRequest } from "./client";
import type {
  BankModel,
  BillerCategoryModel,
  BillerModel,
  BillerTypeModel,
  CardTypeModel,
  DonationOrgModel,
} from "./types";

// The backend doesn't declare a response_model for these list/write endpoints
// (the OpenAPI spec just shows "string"), so the actual response shape is
// whatever the server returns — callers should treat it as unknown and
// fall back to rendering the raw payload when it isn't the shape expected.

export function getBanks(bearerToken: string) {
  return apiRequest<unknown>("/master-data/banks", {
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function createBank(body: BankModel, bearerToken: string) {
  return apiRequest<unknown>("/master-data/banks", {
    method: "POST",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function updateBank(
  bankId: number,
  body: BankModel,
  bearerToken: string,
) {
  return apiRequest<unknown>(`/master-data/banks/${bankId}`, {
    method: "PUT",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function removeBank(bankId: number, bearerToken: string) {
  return apiRequest<unknown>(`/master-data/banks/${bankId}`, {
    method: "DELETE",
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function getBillers(bearerToken: string) {
  return apiRequest<unknown>("/master-data/billers", {
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function createBiller(body: BillerModel, bearerToken: string) {
  return apiRequest<unknown>("/master-data/billers", {
    method: "POST",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function updateBiller(
  billerId: number,
  body: BillerModel,
  bearerToken: string,
) {
  return apiRequest<unknown>(`/master-data/billers/${billerId}`, {
    method: "PUT",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function removeBiller(billerId: number, bearerToken: string) {
  return apiRequest<unknown>(`/master-data/billers/${billerId}`, {
    method: "DELETE",
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function getDonations(bearerToken: string) {
  return apiRequest<unknown>("/master-data/donations", {
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function createDonation(body: DonationOrgModel, bearerToken: string) {
  return apiRequest<unknown>("/master-data/donations", {
    method: "POST",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function updateDonation(
  orgId: number,
  body: DonationOrgModel,
  bearerToken: string,
) {
  return apiRequest<unknown>(`/master-data/donations/${orgId}`, {
    method: "PUT",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function removeDonation(orgId: number, bearerToken: string) {
  return apiRequest<unknown>(`/master-data/donations/${orgId}`, {
    method: "DELETE",
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function getBillerTypes(bearerToken: string) {
  return apiRequest<unknown>("/master-data/biller-types", {
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function createBillerType(body: BillerTypeModel, bearerToken: string) {
  return apiRequest<unknown>("/master-data/biller-types", {
    method: "POST",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function getBillerCategories(bearerToken: string) {
  return apiRequest<unknown>("/master-data/biller-categories", {
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function createBillerCategory(
  body: BillerCategoryModel,
  bearerToken: string,
) {
  return apiRequest<unknown>("/master-data/biller-categories", {
    method: "POST",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function getCardTypes(bearerToken: string) {
  return apiRequest<unknown>("/master-data/card-types", {
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function createCardType(body: CardTypeModel, bearerToken: string) {
  return apiRequest<unknown>("/master-data/card-types", {
    method: "POST",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}
