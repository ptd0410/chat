import { configureFileStorage } from "@file-storage/client";
import { getAuthStore } from "#/modules/auth";

export function setupFileStorageClient() {
  configureFileStorage({
    baseUrl: "http://localhost:3000/api/file-storage",
    // Client gọi `this.fetchFn()`, native fetch sẽ throw Illegal invocation nếu mất Window.
    fetch: globalThis.fetch.bind(globalThis),
    getHeaders: () => {
      const token = getAuthStore().accessToken;
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      return headers;
    },
  });
}
