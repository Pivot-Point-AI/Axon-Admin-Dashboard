// Types mirror the OpenAPI schema served at {API_BASE_URL}/openapi.json ("Bank Assistant API").

export interface StartSessionRequest {
  user_id: string;
  institution_id?: string | null;
  is_welcome?: boolean | null;
  username?: string | null;
  language_code?: string | null;
}

export interface StartSessionResponse {
  session_id: string;
  access_token: string;
  expires_in: number;
  token_type: string;
  message: string;
  language_code: string;
}

export interface ChatHistoryMessage {
  type: string;
  content: unknown;
  created_at: string;
}

export interface ChatHistoryResponse {
  user_id: string;
  date_from: string;
  date_to: string;
  messages: ChatHistoryMessage[];
}

export interface DeleteChatHistoryResponse {
  user_id: string;
  deleted_messages: number;
}

export interface InstitutionItem {
  institution_id: string;
  institution_name: string;
  license_expires_at: string | null;
}

export interface CreateInstitutionRequest {
  institution_name: string;
  license_expires_at: string;
}

export interface CreateInstitutionResponse {
  institution_id: string;
  institution_name: string;
  license_key: string;
  license_expires_at: string;
}

export interface UpdateInstitutionRequest {
  institution_name: string;
}

export interface RenewInstitutionLicenseRequest {
  license_expires_at: string;
}

export interface DeleteInstitutionResponse {
  institution_id: string;
  deleted: boolean;
}

export interface DashboardUserResponse {
  user_id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export interface CreateDashboardUserRequest {
  username: string;
  email: string;
  role: string;
}

export interface ConfigResponse {
  config_key: string;
  config_value: string;
  description?: string | null;
  updated_at?: string | null;
}

export interface ConfigUpdateRequest {
  config_value: string;
  description?: string | null;
}

export interface BankModel {
  bank_id?: number;
  bank_name: string;
  abbreviation?: string | null;
  is_active?: boolean;
}

export interface BillerModel {
  biller_id?: number;
  company: string;
  abbreviation?: string | null;
  biller_type?: string | null;
  category: string;
  is_active?: boolean;
}

export interface DonationOrgModel {
  org_id?: number;
  org_name: string;
  is_zakat_eligible?: boolean;
  is_donation_eligible?: boolean;
  synonyms?: string | null;
  is_active?: boolean;
}

export interface MessageModel {
  message_key: string;
  parameters?: unknown[];
  is_active?: boolean;
  [key: string]: unknown;
}

export interface FlowModel {
  intent_name: string;
  is_enabled?: boolean;
}

export interface LanguageModel {
  language_code: string;
  language_name: string;
  is_enabled?: boolean;
}

export interface LanguageUpdateModel {
  language_name: string;
  is_enabled?: boolean;
}

export interface PrimaryLanguageModel {
  language_code: string;
}

export interface LogSessionsResponse {
  [key: string]: unknown;
}

export interface LogHistoryResponse {
  [key: string]: unknown;
}

export interface HealthResponse {
  [key: string]: unknown;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}
