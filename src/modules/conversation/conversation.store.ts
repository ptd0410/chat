import { create } from "zustand";

export type ConversationComposer = "friend" | "group";

type ConversationUiStore = {
  composer: ConversationComposer | null;
  openComposer: (composer: ConversationComposer) => void;
  closeComposer: () => void;
};

export const useConversationUiStore = create<ConversationUiStore>((set) => ({
  composer: null,
  openComposer: (composer) => set({ composer }),
  closeComposer: () => set({ composer: null }),
}));
