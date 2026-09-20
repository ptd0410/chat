import type { ChatMessageView } from "#/modules/conversation";
import { create } from "zustand";

type ChatDraftStore = {
  threadKey: string | null;
  replyTo: ChatMessageView | null;
  editing: ChatMessageView | null;
  bindThread: (key: string | null) => void;
  startReply: (message: ChatMessageView) => void;
  startEdit: (message: ChatMessageView) => void;
  clearReply: () => void;
  clearEdit: () => void;
  prune: (messageIds: number[] | null) => void;
};

export const useChatDraftStore = create<ChatDraftStore>((set, get) => ({
  threadKey: null,
  replyTo: null,
  editing: null,
  bindThread: (key) => {
    if (get().threadKey === key) return;
    set({ threadKey: key, replyTo: null, editing: null });
  },
  startReply: (message) => set({ editing: null, replyTo: message }),
  startEdit: (message) => set({ replyTo: null, editing: message }),
  clearReply: () => set({ replyTo: null }),
  clearEdit: () => set({ editing: null }),
  prune: (messageIds) => {
    if (messageIds == null) return;
    const ids = new Set(messageIds);
    const { replyTo, editing } = get();
    const nextReply = replyTo != null && ids.has(replyTo.id) ? replyTo : null;
    const nextEdit = editing != null && ids.has(editing.id) ? editing : null;
    if (nextReply === replyTo && nextEdit === editing) return;
    set({ replyTo: nextReply, editing: nextEdit });
  },
}));
