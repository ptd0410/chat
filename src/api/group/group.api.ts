import { apiClient } from "#/clients";
import type {
  GroupAddMembersRequest,
  GroupCreateRequest,
  GroupLeaveResponse,
  GroupResponse,
  GroupTransferOwnerRequest,
  GroupUpdateMemberRoleRequest,
  GroupUpdateRequest,
} from "./group.type";

export const groupApi = {
  list: (): Promise<GroupResponse[]> => apiClient.get("/groups"),
  create: (body: GroupCreateRequest): Promise<GroupResponse> =>
    apiClient.post("/groups", body),
  get: (id: number): Promise<GroupResponse> => apiClient.get(`/groups/${id}`),
  update: (id: number, body: GroupUpdateRequest): Promise<GroupResponse> =>
    apiClient.patch(`/groups/${id}`, body),
  addMembers: (
    id: number,
    body: GroupAddMembersRequest,
  ): Promise<GroupResponse> => apiClient.post(`/groups/${id}/members`, body),
  updateMemberRole: (
    id: number,
    userId: number,
    body: GroupUpdateMemberRoleRequest,
  ): Promise<GroupResponse> =>
    apiClient.patch(`/groups/${id}/members/${userId}`, body),
  transferOwner: (
    id: number,
    body: GroupTransferOwnerRequest,
  ): Promise<GroupResponse> => apiClient.post(`/groups/${id}/owner`, body),
  removeMember: (id: number, userId: number): Promise<GroupResponse> =>
    apiClient.delete(`/groups/${id}/members/${userId}`),
  leave: (id: number): Promise<GroupLeaveResponse> =>
    apiClient.post(`/groups/${id}/leave`),
};
