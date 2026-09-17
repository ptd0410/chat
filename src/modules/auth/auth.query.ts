import { queryOptions } from "@tanstack/react-query";
import { authApi } from "#/api/auth";
import { authQueryKey } from "./auth.config";
import { getAuthStore, useAuthStore } from "./auth.store";

export function createAutoTokenQuery() {
  return queryOptions({
    queryKey: authQueryKey.token,
    queryFn: async () => {
      try {
        const token = getAuthStore().refreshToken;
        if (!token) return "";
        const rs = await authApi.refresh({ token });
        useAuthStore.setState(rs);
        return rs;
      } catch (error) {
        getAuthStore().clear();
        throw error;
      }
    },
  });
}
