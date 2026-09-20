import { hueFromId, initialsFromName } from "#/lib";
import {
  useBlockedUsers,
  useContacts,
} from "#/modules/contact";
import { useGroup, canTransferGroupOwner } from "#/modules/group";
import { useMe } from "#/modules/auth";
import { useMessages } from "#/modules/message";
import { useCallback, useMemo } from "react";
import {
  useChatThread,
  useConversation,
  useConversations,
} from "../conversation.hook";
import {
  resolveHeaderSubtitle,
  resolveThreadState,
  toChatMessageView,
  type ChatHeader,
  type ChatThreadState,
} from "../conversation.view";

export function useChatThreadData() {
  const { conversationId, directUserId } = useChatThread();
  const { data: me } = useMe();
  const { data: conversations = [], isLoading: loadingList } =
    useConversations();
  const openConversation = useConversation(conversationId);
  const messages = useMessages(conversationId);
  const conversation =
    conversationId != null ? openConversation.data : undefined;
  const existingDirect =
    conversationId == null && directUserId != null
      ? conversations.find(
          (item) => item.type === "DIRECT" && item.peerId === directUserId,
        )
      : undefined;
  const isDraft = conversationId == null && directUserId != null;
  const { data: contacts = [] } = useContacts({ enabled: isDraft });
  const { data: blocked = [] } = useBlockedUsers({ enabled: isDraft });
  const isGroup = conversation?.type === "GROUP";
  const group = useGroup(isGroup ? conversationId : null);

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
  const threadState: ChatThreadState = conversation
    ? resolveThreadState({
        type: conversation.type,
        relation: conversation.relation,
        blockStatus: conversation.blockStatus,
      })
    : blockedRow
      ? "blocked"
      : "open";
  const hue = conversation?.hue ?? hueFromId(conversationId ?? directUserId ?? 0);
  const blockedStatus = threadState === "blocked";
  const blockedByPeer = threadState === "blocked_by_peer";
  const pending = threadState === "incoming_pending";
  const waiting = threadState === "outgoing_pending";

  const header: ChatHeader = {
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
  };

  const threadMessages = useMemo(
    () => (messages.data ?? []).map((item) => toChatMessageView(item, me?.id)),
    [messages.data, me?.id],
  );

  const loadOlder = useCallback(() => {
    if (!messages.hasNextPage || messages.isFetchingNextPage) {
      return Promise.resolve();
    }
    return messages.fetchNextPage();
  }, [messages.hasNextPage, messages.isFetchingNextPage, messages.fetchNextPage]);

  return {
    conversationId,
    directUserId,
    conversation,
    missing:
      (conversationId == null && directUserId == null) ||
      (conversationId != null &&
        messages.isError &&
        !loadingList &&
        !openConversation.isLoading &&
        conversation == null),
    redirectId: existingDirect?.id ?? null,
    header,
    messages: threadMessages,
    messagesReady: messages.data != null,
    hasOlder: Boolean(messages.hasNextPage),
    loadingOlder: messages.isFetchingNextPage,
    loadOlder,
    threadState,
    conversationType,
    myRole,
    isGroup,
    blocked: blockedStatus,
    blockedByPeer,
    pending,
    waiting,
    canCompose: !blockedStatus && !blockedByPeer,
    canAddMembers: isGroup && (myRole === "OWNER" || myRole === "ADMIN"),
    canTransferOwner: canTransferGroupOwner({
      myRole,
      memberCount: group.data?.memberCount ?? conversation?.memberCount,
    }),
    memberCount: group.data?.memberCount ?? conversation?.memberCount ?? 0,
    existingUserIds: (group.data?.members ?? []).map((item) => item.userId),
  };
}

export type ChatThreadData = ReturnType<typeof useChatThreadData>;
