import { queryClient } from "#/clients";
import { authApi } from "#/api/auth";
import { contactQueryKey } from "#/modules/contact/contact.config";
import { conversationQueryKey } from "#/modules/conversation/conversation.config";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authQueryKey } from "./auth.config";
import { createAutoTokenQuery } from "./auth.query";
import { getAuthStore, useAuthStore } from "./auth.store";

export function useIsAuth() {
  const isAuth = useAuthStore((s) => !!s.refreshToken);
  return { isAuth };
}

export function useAutoToken() {
  return useQuery(createAutoTokenQuery());
}

export function useMe() {
  const { isAuth } = useIsAuth();
  return useQuery({
    queryKey: authQueryKey.me,
    queryFn: authApi.me,
    enabled: isAuth,
  });
}

export function useUpdateMe() {
  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: (me) => {
      queryClient.setQueryData(authQueryKey.me, me);
      void queryClient.invalidateQueries({ queryKey: conversationQueryKey.list });
      void queryClient.invalidateQueries({ queryKey: contactQueryKey.list });
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      getAuthStore().clear();
      await queryClient.removeQueries({ queryKey: authQueryKey.me });
    },
    onSuccess: () => {
      navigate({ to: "/login" });
    },
  });
}
