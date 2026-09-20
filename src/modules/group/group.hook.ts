import { groupApi } from "#/api/group";
import { queryClient } from "#/clients";
import { conversationQueryKey } from "#/modules/conversation/conversation.config";
import { messageQueryKey } from "#/modules/message/message.config";
import { useMutation, useQuery } from "@tanstack/react-query";
import { groupQueryKey } from "./group.config";

export function useGroup(groupId: number | null) {
  return useQuery({
    queryKey: groupQueryKey.detail(groupId ?? 0),
    queryFn: () => groupApi.get(groupId!),
    enabled: groupId != null && !Number.isNaN(groupId),
  });
}

export function useCreateGroup() {
  return useMutation({
    mutationFn: groupApi.create,
  });
}

export function useAddGroupMembers() {
  return useMutation({
    mutationFn: ({ id, userIds }: { id: number; userIds: number[] }) =>
      groupApi.addMembers(id, { userIds }),
    onSuccess: (group) => {
      void queryClient.invalidateQueries({
        queryKey: groupQueryKey.detail(group.id),
      });
      void queryClient.invalidateQueries({ queryKey: conversationQueryKey.list });
    },
  });
}

export function useLeaveGroup() {
  return useMutation({
    mutationFn: groupApi.leave,
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: conversationQueryKey.list });
      void queryClient.invalidateQueries({ queryKey: groupQueryKey.all });
      queryClient.removeQueries({ queryKey: groupQueryKey.detail(id) });
      queryClient.removeQueries({ queryKey: messageQueryKey.list(id) });
    },
  });
}

export function useTransferOwner() {
  return useMutation({
    mutationFn: ({ id, userId }: { id: number; userId: number }) =>
      groupApi.transferOwner(id, { userId }),
    onSuccess: (group) => {
      void queryClient.invalidateQueries({
        queryKey: groupQueryKey.detail(group.id),
      });
      void queryClient.invalidateQueries({ queryKey: conversationQueryKey.list });
    },
  });
}

export function useRemoveGroupMember() {
  return useMutation({
    mutationFn: ({ id, userId }: { id: number; userId: number }) =>
      groupApi.removeMember(id, userId),
    onSuccess: (group) => {
      void queryClient.invalidateQueries({
        queryKey: groupQueryKey.detail(group.id),
      });
      void queryClient.invalidateQueries({ queryKey: conversationQueryKey.list });
    },
  });
}
