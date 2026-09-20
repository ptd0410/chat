import { apiErrorMessage } from "#/lib";
import {
  refreshInbox,
  useConversations,
  type ChatMessageView,
  type ConversationListItem,
} from "#/modules/conversation";
import { useSendMessage } from "#/modules/message";
import { useCallback, useMemo, useState } from "react";

function canForwardTo(item: ConversationListItem) {
  return (
    item.blockStatus !== "blocked" && item.blockStatus !== "blocked_by_peer"
  );
}

export function useForwardMessage({
  message,
  onClose,
}: {
  message: ChatMessageView | null;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const {
    data: conversations = [],
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useConversations();
  const send = useSendMessage();

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const targets = useMemo(() => {
    const list = conversations.filter(canForwardTo);
    const q = query.trim().toLowerCase();
    const matched = q
      ? list.filter((item) => item.name.toLowerCase().includes(q))
      : list;
    const saved = matched.filter((item) => item.type === "SAVED");
    const rest = matched.filter((item) => item.type !== "SAVED");
    return [...saved, ...rest];
  }, [conversations, query]);

  function reset() {
    setQuery("");
    setSelected([]);
    setError(null);
    send.reset();
  }

  function close() {
    reset();
    onClose();
  }

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function submit() {
    if (!message || selected.length === 0 || send.isPending) return;
    setError(null);
    try {
      for (const conversationId of selected) {
        await send.mutateAsync({
          conversationId,
          forwardFromMessageId: message.id,
        });
        setSelected((prev) => prev.filter((id) => id !== conversationId));
      }
      refreshInbox();
      close();
    } catch (err) {
      setError(apiErrorMessage(err, "Không chuyển tiếp được tin nhắn"));
    }
  }

  const preview =
    message?.content ||
    message?.attachments.map((item) => item.name).join(", ") ||
    "Tin nhắn";

  return {
    query,
    setQuery,
    selected,
    error,
    targets,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    sending: send.isPending,
    preview,
    loadMore,
    toggle,
    submit,
    close,
  };
}
