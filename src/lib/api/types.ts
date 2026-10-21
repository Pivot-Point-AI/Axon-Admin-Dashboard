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
  is_active?: boolean;
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
  institution_name?: string | null;
  is_active?: boolean | null;
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
  is_active: boolean;
  created_at: string;
}

export interface CreateDashboardUserRequest {
  username: string;
  email: string;
  role: string;
}

export interface UpdateDashboardUserRequest {
  username?: string | null;
  email?: string | null;
  role?: string | null;
  is_active?: boolean | null;
}

export interface DashboardOverviewResponse {
  top_kpis?: Record<string, unknown>;
  audience_engagement?: Record<string, unknown>;
  banking_journeys?: Record<string, unknown>;
  license_overview?: Record<string, unknown>;
  total_users: number;
  active_sessions: number;
  daily_active_users: {
    count: number;
    yesterday_count: number;
    growth_pct: number;
    display?: string | null;
  };
  stickiness_ratio_pct: number;
  total_sessions: number;
  engaged_sessions_rate_pct: number;
  returning_user_rate_pct: number;
  total_flows_initiated: number;
  flow_completion_rate_pct: number;
  flow_abandonment_rate_pct: number;
}

export interface ConfigResponse {
  config_key: string;
  config_value: string;
  description?: string | null;
  updated_at?: string | null;
  data_type?: string;
  min_value?: number | null;
  max_value?: number | null;
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

export interface BillerTypeModel {
  type_name: string;
  is_active?: boolean;
}

export interface CardTypeModel {
  type_name: string;
  is_active?: boolean;
}

export interface BillerCategoryModel {
  category_name: string;
  is_active?: boolean;
}

export interface MessageModel {
  message_key: string;
  parameters?: string[] | null;
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

// One structured log event — pushed by the live WebSocket, and returned
// (JSON-encoded, one per line) by /logs/history. The listed keys are the
// common ones; individual events may carry extra fields.
export interface LogEvent {
  level?: string;
  event?: string;
  session_id?: string;
  user_id?: string;
  flow_id?: string;
  timestamp?: string;
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
