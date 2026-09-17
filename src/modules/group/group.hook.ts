import { groupApi } from "#/api/group";
import { queryClient } from "#/clients";
import { conversationQueryKey } from "#/modules/conversation/conversation.config";
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
  });
}
