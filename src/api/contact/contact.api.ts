import { apiClient } from "#/clients";
import type {
  BlockedListResponse,
  ContactAddRequest,
  ContactBlockRequest,
  ContactItemResponse,
  ContactListResponse,
  ContactSearchRequest,
  ContactSearchResponse,
} from "./contact.type";

export const contactApi = {
  search: (params: ContactSearchRequest): Promise<ContactSearchResponse> =>
    apiClient.get("/contacts/search", { params }),
  list: (): Promise<ContactListResponse> => apiClient.get("/contacts"),
  add: (body: ContactAddRequest): Promise<ContactItemResponse> =>
    apiClient.post("/contacts", body),
  listBlocked: (): Promise<BlockedListResponse> =>
    apiClient.get("/contacts/blocked"),
  block: (body: ContactBlockRequest): Promise<{ ok: true }> =>
    apiClient.post("/contacts/block", body),
  unblock: (userId: number): Promise<{ ok: true }> =>
    apiClient.delete(`/contacts/block/${userId}`),
};
