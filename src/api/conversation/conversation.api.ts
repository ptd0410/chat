import { apiClient } from "#/clients";
import type {
  ConversationHideResponse,
  InboxConversationListRequest,
  InboxConversationListResponse,
  InboxConversationResponse,
} from "./conversation.type";

export const conversationApi = {
  list: (
    params?: InboxConversationListRequest,
  ): Promise<InboxConversationListResponse> =>
    apiClient.get("/conversations", { params }),
  get: (id: number): Promise<InboxConversationResponse> =>
    apiClient.get(`/conversations/${id}`),
  hide: (id: number): Promise<ConversationHideResponse> =>
    apiClient.delete(`/conversations/${id}`),
};
