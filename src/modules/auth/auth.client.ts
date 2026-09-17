import { apiClient } from "#/clients";
import { authService } from "./auth.service";
import { getAuthStore } from "./auth.store";

let attached = false;

export function setupAuthClient() {
  if (attached) return;
  attached = true;

  apiClient.interceptors.request.use(
    (config) => {
      const token = getAuthStore().accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  apiClient.interceptors.response.use(undefined, async (error) => {
    if (error.response?.status === 401) {
      authService.invalidateToken();
    }
    return Promise.reject(error);
  });
}
