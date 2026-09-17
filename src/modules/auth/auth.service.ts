import { queryClient } from "#/clients";
import { authQueryKey } from "./auth.config";
import { createAutoTokenQuery } from "./auth.query";

export const authService = {
  invalidateToken: () =>
    queryClient.invalidateQueries({ queryKey: authQueryKey.token }),
  ensureAuthToken: () => queryClient.ensureQueryData(createAutoTokenQuery()),
};
