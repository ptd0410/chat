import { Button } from "#/components/ui";
import {
  useConversationUiStore,
  useConversations,
} from "#/modules/conversation";
import { PenLine, Users } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { ConversationItem } from "./ConversationItem";
import {
  InfiniteScrollSentinel,
  SidebarEmpty,
  SidebarHeader,
  SidebarSearch,
} from "#/components/features/shared";

export function ConversationList() {
  const {
    data: conversations = [],
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useConversations();
  const openComposer = useConversationUiStore((s) => s.openComposer);
  const [query, setQuery] = useState("");

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((item) => item.name.toLowerCase().includes(q));
  }, [conversations, query]);

  const pending = filtered.filter(
    (item) => item.type !== "SAVED" && item.relation === "incoming_pending",
  );
  const rest = filtered.filter(
    (item) => item.type !== "SAVED" && item.relation !== "incoming_pending",
  );
  const saved = filtered.filter((item) => item.type === "SAVED");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SidebarHeader
        title="Tin nhắn"
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 rounded-full text-white/70 hover:bg-white/8 hover:text-white"
              onClick={() => openComposer("group")}
            >
              <Users className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 rounded-full text-white/70 hover:bg-white/8 hover:text-white"
              onClick={() => openComposer("friend")}
            >
              <PenLine className="size-4" />
            </Button>
          </>
        }
      />
      <SidebarSearch
        value={query}
        onChange={setQuery}
        placeholder="Tìm hội thoại"
      />
      <div className="chat-scroll min-h-0 flex-1 overflow-y-auto py-1">
        {isLoading ? (
          <SidebarEmpty>Đang tải hội thoại...</SidebarEmpty>
        ) : filtered.length === 0 ? (
          <SidebarEmpty>
            Chưa có hội thoại. Thêm bạn hoặc tạo nhóm để bắt đầu.
          </SidebarEmpty>
        ) : (
          <>
            {saved.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
              />
            ))}
            {pending.length > 0 ? (
              <section>
                <p className="px-4 pt-2 pb-1 text-[11px] tracking-wide text-amber-200/70 uppercase">
                  Tin nhắn chờ
                </p>
                {pending.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                  />
                ))}
              </section>
            ) : null}
            {rest.length > 0 ? (
              <section>
                {pending.length > 0 ? (
                  <p className="px-4 pt-3 pb-1 text-[11px] tracking-wide text-white/35 uppercase">
                    Tin nhắn
                  </p>
                ) : null}
                {rest.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                  />
                ))}
              </section>
            ) : null}
            <InfiniteScrollSentinel
              enabled={Boolean(hasNextPage)}
              loading={isFetchingNextPage}
              onLoadMore={loadMore}
            />
          </>
        )}
      </div>
    </div>
  );
}
