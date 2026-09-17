import { apiClient } from "#/clients";
import type {
  ConversationHideResponse,
  InboxConversationListResponse,
} from "./conversation.type";

export const conversationApi = {
  list: (): Promise<InboxConversationListResponse> =>
    apiClient.get("/conversations"),
  hide: (id: number): Promise<ConversationHideResponse> =>
    apiClient.delete(`/conversations/${id}`),
};
