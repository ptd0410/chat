import { queryClient } from "#/clients";
import { apiErrorMessage } from "#/lib";
import { contactQueryKey } from "#/modules/contact";
import {
  refreshInbox,
  useConversationItem,
  type ChatThreadData,
} from "#/modules/conversation";
import { useChatDraftStore } from "#/modules/draft";
import {
  useDeleteMessage,
  useEditMessage,
  useReactMessage,
  useSendMessage,
} from "#/modules/message";
import { useNavigate } from "@tanstack/react-router";

function refreshThread() {
  refreshInbox();
  void queryClient.invalidateQueries({ queryKey: contactQueryKey.list });
}

export function useChatActions(thread: ChatThreadData) {
  const navigate = useNavigate();
  const send = useSendMessage();
  const edit = useEditMessage();
  const remove = useDeleteMessage();
  const react = useReactMessage();
  const item = useConversationItem(thread.conversation, thread.directUserId);
  const { conversationId, directUserId } = thread;

  function goHome() {
    void navigate({ to: "/" });
  }

  function goDetail() {
    if (conversationId == null) return;
    void navigate({
      to: "/conversation/$id/detail",
      params: { id: String(conversationId) },
    });
  }

  return {
    sending:
      send.isPending || edit.isPending || remove.isPending || item.pending,
    error: send.error
      ? apiErrorMessage(send.error, "Không gửi được tin nhắn")
      : edit.error
        ? apiErrorMessage(edit.error, "Không sửa được tin nhắn")
        : remove.error
          ? apiErrorMessage(remove.error, "Không xóa được tin nhắn")
          : react.error
            ? apiErrorMessage(react.error, "Không bày tỏ cảm xúc được")
            : item.error,
    goHome,
    goDetail: conversationId != null ? goDetail : undefined,
    block: item.block,
    unblock: item.unblock,
    hide: item.hide,
    sendMessage: async (content: string, files: File[] = []) => {
      const replyToId = useChatDraftStore.getState().replyTo?.id;
      const payload = {
        content,
        files,
        ...(replyToId != null ? { replyToId } : {}),
      };
      if (conversationId != null) {
        await send.mutateAsync(
          { conversationId, ...payload },
          { onSuccess: refreshThread },
        );
        useChatDraftStore.getState().clearReply();
        return;
      }
      if (directUserId == null) return;
      const result = await send.mutateAsync({
        userId: directUserId,
        ...payload,
      });
      useChatDraftStore.getState().clearReply();
      refreshInbox();
      void navigate({
        to: "/conversation/$id",
        params: { id: String(result.conversation.id) },
      });
    },
    editMessage: async (content: string) => {
      const editing = useChatDraftStore.getState().editing;
      if (editing == null) return;
      await edit.mutateAsync({ messageId: editing.id, content });
      useChatDraftStore.getState().clearEdit();
      refreshThread();
    },
    deleteMessage:
      conversationId != null
        ? (messageId: number) => {
            remove.mutate(messageId, { onSuccess: refreshThread });
          }
        : undefined,
    reactMessage:
      conversationId != null
        ? (messageId: number, emoji: string) => {
            react.mutate({ messageId, emoji });
          }
        : undefined,
  };
}

export type ChatActions = ReturnType<typeof useChatActions>;
