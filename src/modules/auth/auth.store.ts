import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthStore = {
  accessToken: string;
  refreshToken: string;
  clear: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: "",
      refreshToken: "",
      clear: () => set({ accessToken: "", refreshToken: "" }),
    }),
    {
      name: "auth-store",
      skipHydration: true,
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
      }),
    },
  ),
);

export function getAuthStore() {
  return useAuthStore.getState();
}
