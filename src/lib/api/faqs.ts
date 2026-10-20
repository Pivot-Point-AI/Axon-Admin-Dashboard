import { ADMIN_API_BASE_URL, apiRequest } from "./client";

export interface FAQItemModel {
  section_title: string;
  question: string;
  answer: string;
  section_order?: number | null;
  item_order?: number | null;
  is_active?: boolean | null;
}

export interface FAQSettingsModel {
  title: string;
  subtitle: string;
}

export function getFaqs(bearerToken: string, signal?: AbortSignal) {
  return apiRequest<unknown>("/faqs/", {
    bearerToken,
    signal,
    query: { active_only: false },
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function getFaq(faqId: number, bearerToken: string) {
  return apiRequest<unknown>(`/faqs/${faqId}`, {
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function createFaq(body: FAQItemModel, bearerToken: string) {
  return apiRequest<unknown>("/faqs/", {
    method: "POST",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function updateFaq(
  faqId: number,
  body: FAQItemModel,
  bearerToken: string,
) {
  return apiRequest<unknown>(`/faqs/${faqId}`, {
    method: "PUT",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function removeFaq(faqId: number, bearerToken: string) {
  return apiRequest<unknown>(`/faqs/${faqId}`, {
    method: "DELETE",
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function updateFaqHeader(body: FAQSettingsModel, bearerToken: string) {
  return apiRequest<unknown>("/faqs/settings/header", {
    method: "PUT",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}
