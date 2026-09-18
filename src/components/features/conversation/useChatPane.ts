import { queryClient } from "#/clients";
import { apiErrorMessage, hueFromId, initialsFromName } from "#/lib";
import { useMe } from "#/modules/auth";
import {
  contactQueryKey,
  useBlockedUsers,
  useContacts,
} from "#/modules/contact";
import {
  refreshInbox,
  useChatThread,
  useConversationItem,
  useConversations,
} from "#/modules/conversation";
import { useGroup } from "#/modules/group";
import { useDeleteMessage, useMessages, useSendMessage } from "#/modules/message";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  resolveHeaderSubtitle,
  resolveThreadState,
  toChatMessageView,
  type ChatMessageView,
} from "./conversation.view";

export function useChatPane() {
  const { conversationId, directUserId } = useChatThread();
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { data: conversations = [], isLoading: loadingList } =
    useConversations();
  const messages = useMessages(conversationId);
  const send = useSendMessage();
  const remove = useDeleteMessage();
  const conversation =
    conversationId != null
      ? conversations.find((item) => item.id === conversationId)
      : undefined;
  const existingDirect =
    conversationId == null && directUserId != null
      ? conversations.find(
          (item) => item.type === "DIRECT" && item.peerId === directUserId,
        )
      : undefined;
  const isDraft = conversationId == null && directUserId != null;
  const { data: contacts = [] } = useContacts({ enabled: isDraft });
  const { data: blocked = [] } = useBlockedUsers({ enabled: isDraft });
  const actions = useConversationItem(conversation, directUserId);
  const isGroup = conversation?.type === "GROUP";
  const group = useGroup(isGroup ? conversationId : null);
  const [replyingTo, setReplyingTo] = useState<ChatMessageView | null>(null);

  useEffect(() => {
    setReplyingTo(null);
  }, [conversationId, directUserId]);

  const contact =
    isDraft && directUserId != null
      ? contacts.find((item) => item.user.id === directUserId)
      : undefined;
  const blockedRow =
    isDraft && directUserId != null
      ? blocked.find((item) => item.user.id === directUserId)
      : undefined;

  const name = conversation
    ? conversation.name
    : contact?.user.name || contact?.user.email || "Người dùng";
  const conversationType = conversation?.type ?? "DIRECT";
  const myRole = group.data?.myRole ?? conversation?.myRole ?? null;
  const threadState = conversation
    ? resolveThreadState({
        type: conversation.type,
        relation: conversation.relation,
        blockStatus: conversation.blockStatus,
      })
    : blockedRow
      ? "blocked"
      : "open";
  const hue = conversation?.hue ?? hueFromId(conversationId ?? directUserId ?? 0);
  const canAddMembers =
    isGroup && (myRole === "OWNER" || myRole === "ADMIN");

  function refreshThread() {
    refreshInbox();
    void queryClient.invalidateQueries({ queryKey: contactQueryKey.list });
  }

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

  const sending = send.isPending || remove.isPending || actions.pending;
  const error = send.error
    ? apiErrorMessage(send.error, "Không gửi được tin nhắn")
    : remove.error
      ? apiErrorMessage(remove.error, "Không xóa được tin nhắn")
      : actions.error;
  const threadMessages = (messages.data ?? []).map((item) =>
    toChatMessageView(item, me?.id),
  );

  useEffect(() => {
    if (replyingTo == null || messages.data == null) return;
    if (messages.data.some((item) => Number(item.id) === replyingTo.id)) return;
    setReplyingTo(null);
  }, [messages.data, replyingTo]);

  return {
    missing:
      (conversationId == null && directUserId == null) ||
      (conversationId != null &&
        messages.isError &&
        !loadingList &&
        conversation == null),
    redirectId: existingDirect?.id ?? null,
    header: {
      name,
      initials: conversation?.initials ?? initialsFromName(name),
      hue,
      avatar:
        conversation?.peerAvatar ??
        contact?.user.avatar ??
        blockedRow?.user.avatar ??
        null,
      subtitle: conversation
        ? resolveHeaderSubtitle({
            type: conversation.type,
            memberCount: conversation.memberCount,
            threadState,
          })
        : blockedRow
          ? "Đã chặn"
          : "Direct",
    },
    messages: threadMessages,
    sending,
    threadState,
    conversationType,
    myRole,
    error,
    conversationId,
    isGroup,
    canAddMembers,
    existingUserIds: (group.data?.members ?? []).map((item) => item.userId),
    goHome,
    goDetail: conversationId != null ? goDetail : undefined,
    block: actions.block,
    unblock: actions.unblock,
    hide: actions.hide,
    leave: actions.leave,
    replyingTo,
    startReply: (message: ChatMessageView) => {
      setReplyingTo(message);
    },
    clearReply: () => {
      setReplyingTo(null);
    },
    sendMessage: (content: string) => {
      const replyToId = replyingTo?.id;
      setReplyingTo(null);
      const payload = replyToId != null ? { content, replyToId } : { content };
      if (conversationId != null) {
        send.mutate(
          { conversationId, ...payload },
          { onSuccess: refreshThread },
        );
        return;
      }
      if (directUserId == null) return;
      send.mutate(
        { userId: directUserId, ...payload },
        {
          onSuccess: (result) => {
            refreshInbox();
            void navigate({
              to: "/conversation/$id",
              params: { id: String(result.conversation.id) },
            });
          },
        },
      );
    },
    deleteMessage:
      conversationId != null
        ? (messageId: number) => {
            remove.mutate(messageId, { onSuccess: refreshThread });
          }
        : undefined,
  };
}
