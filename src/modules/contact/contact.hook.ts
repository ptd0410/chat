import { queryClient } from "#/clients";
import { contactApi } from "#/api/contact";
import { useMutation, useQuery } from "@tanstack/react-query";
import { contactQueryKey } from "./contact.config";

export function useContacts(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: contactQueryKey.list,
    queryFn: contactApi.list,
    enabled: opts?.enabled ?? true,
  });
}

export function useBlockedUsers(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: contactQueryKey.blocked,
    queryFn: contactApi.listBlocked,
    enabled: opts?.enabled ?? true,
  });
}

export function useSearchContact() {
  return useMutation({
    mutationFn: contactApi.search,
  });
}

export function useAddContact() {
  return useMutation({
    mutationFn: contactApi.add,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contactQueryKey.list });
    },
  });
}

export function useBlockUser() {
  return useMutation({
    mutationFn: contactApi.block,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contactQueryKey.list });
      void queryClient.invalidateQueries({ queryKey: contactQueryKey.blocked });
    },
  });
}

export function useUnblockUser() {
  return useMutation({
    mutationFn: (userId: number) => contactApi.unblock(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contactQueryKey.list });
      void queryClient.invalidateQueries({ queryKey: contactQueryKey.blocked });
    },
  });
}
