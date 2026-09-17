import { apiClient } from "#/clients";
import type {
  MessageDeleteResponse,
  MessageListRequest,
  MessageListResponse,
  MessageSendRequest,
  MessageSendResponse,
} from "./message.type";

export const messageApi = {
  list: (params: MessageListRequest): Promise<MessageListResponse> =>
    apiClient.get("/messages", { params }),
  send: (body: MessageSendRequest): Promise<MessageSendResponse> =>
    apiClient.post("/messages", body),
  remove: (id: number): Promise<MessageDeleteResponse> =>
    apiClient.delete(`/messages/${id}`),
};
