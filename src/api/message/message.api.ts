import { apiClient } from "#/clients";
import type {
  MessageDeleteResponse,
  MessageEditRequest,
  MessageListRequest,
  MessageListResponse,
  MessageReactRequest,
  MessageReactResponse,
  MessageResponse,
  MessageSendRequest,
  MessageSendResponse,
} from "./message.type";

export const messageApi = {
  list: (params: MessageListRequest): Promise<MessageListResponse> =>
    apiClient.get("/messages", { params }),
  send: (body: MessageSendRequest): Promise<MessageSendResponse> =>
    apiClient.post("/messages", body),
  edit: (id: number, body: MessageEditRequest): Promise<MessageResponse> =>
    apiClient.patch(`/messages/${id}`, body),
  react: (
    id: number,
    body: MessageReactRequest,
  ): Promise<MessageReactResponse> =>
    apiClient.post(`/messages/${id}/reactions`, body),
  remove: (id: number): Promise<MessageDeleteResponse> =>
    apiClient.delete(`/messages/${id}`),
};
