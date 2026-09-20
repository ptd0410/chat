import { conversationApi } from "#/api/conversation";
import { contactQueryKey } from "#/modules/contact/contact.config";
import { useBlockUser, useUnblockUser } from "#/modules/contact";
import { groupQueryKey } from "#/modules/group/group.config";
import { messageQueryKey } from "#/modules/message";
import { onInboxUpdated, onMessageCreated } from "#/modules/realtime";
import { queryClient } from "#/clients";
import { apiErrorMessage } from "#/lib";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  CONVERSATION_PAGE_SIZE,
  conversationQueryKey,
} from "./conversation.config";
import {
  toConversationListItem,
  type ConversationListItem,
} from "./conversation.mapper";

let realtimeUsers = 0;
let detachRealtime: (() => void) | null = null;

function retainConversationRealtime() {
  if (realtimeUsers === 0) {
    const invalidate = () => {
      void queryClient.invalidateQueries({ queryKey: conversationQueryKey.list });
      void queryClient.invalidateQueries({ queryKey: groupQueryKey.all });
      void queryClient.invalidateQueries({ queryKey: contactQueryKey.list });
      void queryClient.invalidateQueries({ queryKey: contactQueryKey.blocked });
    };
    const offCreated = onMessageCreated(invalidate);
    const offInbox = onInboxUpdated(invalidate);
    detachRealtime = () => {
      offCreated();
      offInbox();
    };
  }
  realtimeUsers += 1;
  return () => {
    realtimeUsers -= 1;
    if (realtimeUsers === 0) {
      detachRealtime?.();
      detachRealtime = null;
    }
  };
}

export function useConversations() {
  useEffect(() => retainConversationRealtime(), []);
  const query = useInfiniteQuery({
    queryKey: conversationQueryKey.list,
    initialPageParam: null as number | null,
    queryFn: ({ pageParam }) =>
      conversationApi.list({
        limit: CONVERSATION_PAGE_SIZE,
        ...(pageParam != null ? { cursor: pageParam } : {}),
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const data = useMemo(
    () =>
      query.data?.pages.flatMap((page) =>
        page.items.map(toConversationListItem),
      ) ?? [],
    [query.data],
  );

  return { ...query, data };
}

export function useConversation(conversationId: number | null) {
  const list = useConversations();
  const fromList =
    conversationId == null
      ? undefined
      : list.data.find((item) => item.id === conversationId);

  const detail = useQuery({
    queryKey: conversationQueryKey.detail(conversationId ?? 0),
    queryFn: async () =>
      toConversationListItem(await conversationApi.get(conversationId!)),
    enabled:
      conversationId != null &&
      !Number.isNaN(conversationId) &&
      fromList == null &&
      !list.isPending,
  });

  return {
    data: fromList ?? detail.data,
    isLoading:
      conversationId != null &&
      fromList == null &&
      (list.isPending || detail.isPending),
    isError: fromList == null && detail.isError,
  };
}

export function useHideConversation() {
  return useMutation({
    mutationFn: conversationApi.hide,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: conversationQueryKey.list });
    },
  });
}

function parseRouteId(value: unknown) {
  if (typeof value === "number") return Number.isNaN(value) ? null : value;
  if (typeof value !== "string") return null;
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
}

export function useChatThread() {
  const params = useParams({ strict: false });
  const conversationId = parseRouteId(params.id);
  const directUserId = parseRouteId(params.userId);
  return {
    conversationId,
    directUserId,
    hasThread: conversationId != null || directUserId != null,
  };
}

export function refreshInbox() {
  void queryClient.invalidateQueries({ queryKey: conversationQueryKey.list });
}

export function useOpenConversation() {
  const navigate = useNavigate();
  const { data: conversations = [] } = useConversations();

  function select(id: number) {
    void navigate({
      to: "/conversation/$id",
      params: { id: String(id) },
    });
  }

  function openDirect(userId: number) {
    const existing = conversations.find(
      (item) => item.type === "DIRECT" && item.peerId === userId,
    );
    if (existing) {
      select(existing.id);
      return;
    }
    void navigate({
      to: "/direct/$userId",
      params: { userId: String(userId) },
    });
  }

  return { select, openDirect };
}

export function useConversationItem(
  conversation?: ConversationListItem | null,
  peerUserId?: number | null,
) {
  const navigate = useNavigate();
  const { conversationId } = useChatThread();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const hideConversation = useHideConversation();
  const peerId = conversation?.peerId ?? peerUserId ?? null;
  const isDirect =
    conversation != null ? conversation.type === "DIRECT" : peerId != null;
  const active =
    conversation != null && conversation.id === conversationId;

  function goHomeIfActive() {
    if (active) void navigate({ to: "/" });
  }

  function select() {
    if (conversation == null) return;
    void navigate({
      to: "/conversation/$id",
      params: { id: String(conversation.id) },
    });
  }

  function block() {
    if (peerId == null) return;
    blockUser.mutate({ userId: peerId }, { onSuccess: refreshInbox });
  }

  function unblock() {
    if (peerId == null) return;
    unblockUser.mutate(peerId, { onSuccess: refreshInbox });
  }

  function hide() {
    if (conversation == null) return;
    hideConversation.mutate(conversation.id, {
      onSuccess: () => {
        queryClient.removeQueries({
          queryKey: messageQueryKey.list(conversation.id),
        });
        queryClient.removeQueries({
          queryKey: conversationQueryKey.detail(conversation.id),
        });
        goHomeIfActive();
      },
    });
  }

  const pending =
    blockUser.isPending ||
    unblockUser.isPending ||
    hideConversation.isPending;
  const error = blockUser.error
    ? apiErrorMessage(blockUser.error, "Không chặn được")
    : unblockUser.error
      ? apiErrorMessage(unblockUser.error, "Không bỏ chặn được")
      : hideConversation.error
        ? apiErrorMessage(hideConversation.error, "Không xóa được đoạn chat")
        : null;

  return {
    active,
    select,
    block: isDirect && peerId != null ? block : undefined,
    unblock: isDirect && peerId != null ? unblock : undefined,
    hide: conversation?.type === "DIRECT" ? hide : undefined,
    pending,
    error,
  };
}
