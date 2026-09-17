import { apiClient } from "#/clients";
import type {
  AuthMeResponse,
  AuthRefreshRequest,
  AuthTokensResponse,
} from "./auth.type";

export const authApi = {
  refresh: (body: AuthRefreshRequest): Promise<AuthTokensResponse> =>
    apiClient.post("/auth/refresh", body),
  me: (): Promise<AuthMeResponse> => apiClient.get("/auth/me"),
};
