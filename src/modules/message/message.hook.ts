import { queryClient } from "#/clients";
import {
  messageApi,
  type MessageAttachment,
  type MessageListResponse,
  type MessageReactionItem,
  type MessageReactResponse,
  type MessageResponse,
} from "#/api/message";
import { useMe } from "#/modules/auth";
import { uploadChatFiles } from "#/modules/file-storage";
import {
  onMessageCreated,
  onMessageDeleted,
  onMessageReactionUpdated,
  onMessageUpdated,
} from "#/modules/realtime";
import {
  useInfiniteQuery,
  useMutation,
  type InfiniteData,
} from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { MESSAGE_PAGE_SIZE, messageQueryKey } from "./message.config";

function messageId(value: number | string) {
  return Number(value);
}

function normalizeAttachment(
  attachment: MessageAttachment,
): MessageAttachment {
  return {
    ...attachment,
    id: messageId(attachment.id),
    name: attachment.name ?? "Tệp",
    mime: attachment.mime ?? null,
    size: attachment.size ?? null,
    type: attachment.type ?? "DOCUMENT",
    path: attachment.path,
    url: attachment.url,
  };
}

function normalizeReplyTo(
  replyTo: MessageResponse["replyTo"],
): MessageResponse["replyTo"] {
  if (!replyTo) return null;
  return {
    ...replyTo,
    id: messageId(replyTo.id),
    senderId: replyTo.senderId == null ? null : messageId(replyTo.senderId),
    deleted: Boolean(replyTo.deleted),
    attachmentName: replyTo.attachmentName ?? null,
  };
}

function normalizeForwardFrom(
  forwardFrom: MessageResponse["forwardFrom"],
): MessageResponse["forwardFrom"] {
  if (!forwardFrom) return null;
  return {
    senderId:
      forwardFrom.senderId == null ? null : messageId(forwardFrom.senderId),
    senderName: forwardFrom.senderName ?? null,
  };
}

function normalizeReactions(
  reactions: MessageReactionItem[] | undefined,
): MessageReactionItem[] {
  return (reactions ?? []).map((item) => ({
    emoji: item.emoji,
    userId: messageId(item.userId),
  }));
}

function normalizeMessage(message: MessageResponse): MessageResponse {
  return {
    ...message,
    id: messageId(message.id),
    conversationId: messageId(message.conversationId),
    senderId: message.senderId == null ? null : messageId(message.senderId),
    senderName: message.senderName ?? null,
    content: message.content ?? null,
    type: message.type ?? "TEXT",
    editedAt: message.editedAt ?? null,
    replyTo: normalizeReplyTo(message.replyTo),
    forwardFrom: normalizeForwardFrom(message.forwardFrom),
    attachments: (message.attachments ?? []).map(normalizeAttachment),
    reactions: normalizeReactions(message.reactions),
  };
}

type MessagePages = InfiniteData<MessageListResponse, number | null>;

function mapMessagePages(
  prev: MessagePages | undefined,
  updateItems: (items: MessageResponse[]) => MessageResponse[],
) {
  if (!prev) return prev;
  return {
    ...prev,
    pages: prev.pages.map((page) => ({
      ...page,
      items: updateItems(page.items),
    })),
  };
}

function applyMessageCreated(message: MessageResponse) {
  const next = normalizeMessage(message);
  const key = messageQueryKey.list(next.conversationId);
  queryClient.setQueryData<MessagePages>(key, (prev) => {
    if (!prev) {
      return {
        pages: [{ items: [next], nextCursor: null, hasMore: false }],
        pageParams: [null],
      };
    }
    if (
      prev.pages.some((page) =>
        page.items.some((item) => messageId(item.id) === next.id),
      )
    ) {
      return prev;
    }
    const pages = [...prev.pages];
    const newest = pages[0] ?? {
      items: [] as MessageResponse[],
      nextCursor: null,
      hasMore: false,
    };
    pages[0] = { ...newest, items: [...newest.items, next] };
    return { ...prev, pages };
  });
}

function applyMessageUpdated(message: MessageResponse) {
  const next = normalizeMessage(message);
  const key = messageQueryKey.list(next.conversationId);
  queryClient.setQueryData<MessagePages>(key, (prev) =>
    mapMessagePages(prev, (items) =>
      items.map((item) => {
        if (messageId(item.id) === next.id) return next;
        if (item.replyTo && messageId(item.replyTo.id) === next.id) {
          return {
            ...item,
            replyTo: {
              ...item.replyTo,
              content: next.content,
              attachmentName: next.attachments[0]?.name ?? null,
              deleted: false,
            },
          };
        }
        return item;
      }),
    ),
  );
}

function applyMessageDeleted(input: {
  conversationId: number;
  messageId: number;
}) {
  const conversationId = messageId(input.conversationId);
  const id = messageId(input.messageId);
  const key = messageQueryKey.list(conversationId);
  queryClient.setQueryData<MessagePages>(key, (prev) =>
    mapMessagePages(prev, (items) =>
      items.filter((item) => messageId(item.id) !== id),
    ),
  );
}

function applyMessageReactions(input: MessageReactResponse) {
  const conversationId = messageId(input.conversationId);
  const id = messageId(input.messageId);
  const reactions = normalizeReactions(input.reactions);
  const key = messageQueryKey.list(conversationId);
  queryClient.setQueryData<MessagePages>(key, (prev) =>
    mapMessagePages(prev, (items) =>
      items.map((item) =>
        messageId(item.id) === id ? { ...item, reactions } : item,
      ),
    ),
  );
}

let realtimeUsers = 0;
let detachRealtime: (() => void) | null = null;

function retainMessageRealtime() {
  if (realtimeUsers === 0) {
    const offCreated = onMessageCreated((payload) => {
      applyMessageCreated(payload.message);
    });
    const offUpdated = onMessageUpdated((payload) => {
      applyMessageUpdated(payload.message);
    });
    const offDeleted = onMessageDeleted((payload) => {
      applyMessageDeleted(payload);
    });
    const offReaction = onMessageReactionUpdated((payload) => {
      applyMessageReactions(payload);
    });
    detachRealtime = () => {
      offCreated();
      offUpdated();
      offDeleted();
      offReaction();
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

function useMessageRealtime() {
  useEffect(() => retainMessageRealtime(), []);
}

export function useMessages(conversationId: number | null) {
  useMessageRealtime();
  const query = useInfiniteQuery({
    queryKey: messageQueryKey.list(conversationId ?? 0),
    initialPageParam: null as number | null,
    enabled: conversationId != null && !Number.isNaN(conversationId),
    queryFn: async ({ pageParam }) => {
      const page = await messageApi.list({
        conversationId: conversationId!,
        limit: MESSAGE_PAGE_SIZE,
        ...(pageParam != null ? { cursor: pageParam } : {}),
      });
      const seen = new Set<number>();
      return {
        ...page,
        items: page.items.reduce<MessageResponse[]>((list, item) => {
          const next = normalizeMessage(item);
          if (seen.has(next.id)) return list;
          seen.add(next.id);
          list.push(next);
          return list;
        }, []),
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const data = useMemo(() => {
    const pages = query.data?.pages ?? [];
    const seen = new Set<number>();
    const items: MessageResponse[] = [];
    for (const page of [...pages].reverse()) {
      for (const item of page.items) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        items.push(item);
      }
    }
    return items;
  }, [query.data]);

  return { ...query, data };
}

export function useSendMessage() {
  useMessageRealtime();
  const { data: me } = useMe();
  return useMutation({
    mutationFn: async (
      input: Parameters<typeof messageApi.send>[0] & { files?: File[] },
    ) => {
      const { files, ...body } = input;
      if (files?.length && !me?.id) {
        throw new Error("Chưa đăng nhập");
      }
      const attachments = files?.length
        ? await uploadChatFiles(me!.id, files)
        : body.attachments;
      return messageApi.send({
        ...body,
        content: body.content?.trim() || undefined,
        attachments,
      });
    },
    onSuccess: (result) => {
      applyMessageCreated(result.message);
    },
  });
}

export function useDeleteMessage() {
  useMessageRealtime();
  return useMutation({
    mutationFn: messageApi.remove,
    onSuccess: (result) => {
      applyMessageDeleted(result);
    },
  });
}

export function useEditMessage() {
  useMessageRealtime();
  return useMutation({
    mutationFn: ({
      messageId,
      content,
    }: {
      messageId: number;
      content: string;
    }) => messageApi.edit(messageId, { content }),
    onSuccess: (message) => {
      applyMessageUpdated(message);
    },
  });
}

export function useReactMessage() {
  useMessageRealtime();
  return useMutation({
    mutationFn: ({
      messageId,
      emoji,
    }: {
      messageId: number;
      emoji: string;
    }) => messageApi.react(messageId, { emoji }),
    onSuccess: (result) => {
      applyMessageReactions(result);
    },
  });
}
