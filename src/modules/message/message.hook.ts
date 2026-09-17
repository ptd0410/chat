import { queryClient } from "#/clients";
import { messageApi, type MessageResponse } from "#/api/message";
import { onMessageCreated, onMessageDeleted } from "#/modules/realtime";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { messageQueryKey } from "./message.config";

function messageId(value: number | string) {
  return Number(value);
}

function normalizeMessage(message: MessageResponse): MessageResponse {
  return {
    ...message,
    id: messageId(message.id),
    conversationId: messageId(message.conversationId),
    senderId: message.senderId == null ? null : messageId(message.senderId),
  };
}

function applyMessageCreated(message: MessageResponse) {
  const next = normalizeMessage(message);
  const key = messageQueryKey.list(next.conversationId);
  queryClient.setQueryData<MessageResponse[]>(key, (prev) => {
    const list = prev ?? [];
    if (list.some((item) => messageId(item.id) === next.id)) return list;
    return [...list, next];
  });
}

function applyMessageDeleted(input: {
  conversationId: number;
  messageId: number;
}) {
  const conversationId = messageId(input.conversationId);
  const id = messageId(input.messageId);
  const key = messageQueryKey.list(conversationId);
  queryClient.setQueryData<MessageResponse[]>(key, (prev) =>
    prev?.filter((item) => messageId(item.id) !== id),
  );
}

let realtimeUsers = 0;
let detachRealtime: (() => void) | null = null;

function retainMessageRealtime() {
  if (realtimeUsers === 0) {
    const offCreated = onMessageCreated((payload) => {
      applyMessageCreated(payload.message);
    });
    const offDeleted = onMessageDeleted((payload) => {
      applyMessageDeleted(payload);
    });
    detachRealtime = () => {
      offCreated();
      offDeleted();
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
  return useQuery({
    queryKey: messageQueryKey.list(conversationId ?? 0),
    queryFn: async () => {
      const rows = await messageApi.list({ conversationId: conversationId! });
      const seen = new Set<number>();
      return rows.reduce<MessageResponse[]>((list, item) => {
        const next = normalizeMessage(item);
        if (seen.has(next.id)) return list;
        seen.add(next.id);
        list.push(next);
        return list;
      }, []);
    },
    enabled: conversationId != null && !Number.isNaN(conversationId),
  });
}

export function useSendMessage() {
  useMessageRealtime();
  return useMutation({
    mutationFn: messageApi.send,
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
