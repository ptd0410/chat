import { useLogout, useMe } from "#/modules/auth";
import {
  useConversationUiStore,
  useConversations,
} from "#/modules/conversation";
import { Button } from "#/components/ui";
import { initialsFromName } from "#/lib";
import { LogOut, PenLine, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { ConversationItem } from "./ConversationItem";
import { AvatarBadge } from "./AvatarBadge";

export function ConversationList() {
  const { data } = useMe();
  const logout = useLogout();
  const { data: conversations = [], isLoading } = useConversations();
  const openComposer = useConversationUiStore((s) => s.openComposer);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((item) =>
      item.name.toLowerCase().includes(q),
    );
  }, [conversations, query]);

  const pending = filtered.filter(
    (item) => item.relation === "incoming_pending",
  );
  const rest = filtered.filter(
    (item) => item.relation !== "incoming_pending",
  );
  const meName = data?.profile?.name ?? data?.uid ?? "Bạn";
  const meInitials = initialsFromName(meName);

  return (
    <aside className="relative flex h-full w-full flex-col border-r border-white/10 bg-[var(--chat-list)] md:w-[360px] md:shrink-0">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.18em] text-teal-300/80 uppercase">
            Halo
          </p>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-white">
            Messages
          </h1>
        </div>
        <div className="flex items-center gap-1">
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
        </div>
      </div>

      <div className="px-3 pb-3">
        <label className="flex h-10 items-center gap-2 rounded-xl bg-white/6 px-3 ring-1 ring-white/6 focus-within:ring-teal-400/40">
          <Search className="size-4 text-white/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm hội thoại"
            className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          />
        </label>
      </div>

      <div className="chat-scroll min-h-0 flex-1 overflow-y-auto py-1">
        {isLoading ? (
          <p className="px-4 py-8 text-center text-sm text-white/40">
            Đang tải hội thoại...
          </p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-white/40">
            Chưa có hội thoại. Thêm bạn hoặc tạo nhóm để bắt đầu.
          </p>
        ) : (
          <>
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
          </>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-white/6 px-3 py-3">
        <AvatarBadge initials={meInitials} hue={175} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{meName}</p>
          <p className="text-[11px] text-white/35">Đang hoạt động</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 rounded-full text-white/50 hover:bg-white/8 hover:text-white"
          onClick={() => logout.mutate()}
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </aside>
  );
}
