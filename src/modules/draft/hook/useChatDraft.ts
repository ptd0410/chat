import type { ChatMessageView } from "#/modules/conversation";
import { useEffect } from "react";
import { useChatDraftStore } from "../draft.store";

export function chatThreadKey(
  conversationId: number | null,
  directUserId: number | null,
) {
  if (conversationId != null) return `c:${conversationId}`;
  if (directUserId != null) return `u:${directUserId}`;
  return null;
}

export function useChatDraft(input: {
  conversationId: number | null;
  directUserId: number | null;
  messages: ChatMessageView[] | null;
}) {
  const threadKey = chatThreadKey(input.conversationId, input.directUserId);
  const bindThread = useChatDraftStore((state) => state.bindThread);
  const prune = useChatDraftStore((state) => state.prune);
  const replyTo = useChatDraftStore((state) => state.replyTo);
  const editing = useChatDraftStore((state) => state.editing);
  const startReply = useChatDraftStore((state) => state.startReply);
  const startEdit = useChatDraftStore((state) => state.startEdit);
  const clearReply = useChatDraftStore((state) => state.clearReply);
  const clearEdit = useChatDraftStore((state) => state.clearEdit);

  useEffect(() => {
    bindThread(threadKey);
  }, [bindThread, threadKey]);

  useEffect(() => {
    prune(input.messages?.map((item) => item.id) ?? null);
  }, [input.messages, prune]);

  return {
    replyTo,
    editing,
    startReply,
    startEdit,
    clearReply,
    clearEdit,
  };
}
