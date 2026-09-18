import { apiRequest } from "./client";
import type { ChatHistoryResponse, DeleteChatHistoryResponse } from "./types";

export function getChatHistory(
  params: { userId: string; dateFrom: string; dateTo: string },
  bearerToken: string,
) {
  return apiRequest<ChatHistoryResponse>("/chat-history", {
    query: {
      user_id: params.userId,
      date_from: params.dateFrom,
      date_to: params.dateTo,
    },
    bearerToken,
  });
}

export function deleteChatHistory(userId: string, bearerToken: string) {
  return apiRequest<DeleteChatHistoryResponse>("/chat-history", {
    method: "DELETE",
    query: { user_id: userId },
    bearerToken,
  });
}
