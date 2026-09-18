import { create } from "zustand";

export type LastThread =
  | { to: "/conversation/$id"; params: { id: string } }
  | { to: "/direct/$userId"; params: { userId: string } };

type NavStore = {
  lastThread: LastThread | null;
  rememberThread: (thread: LastThread) => void;
};

export const useNavStore = create<NavStore>((set) => ({
  lastThread: null,
  rememberThread: (thread) => set({ lastThread: thread }),
}));
