import type { ConversationType } from "#/api/conversation";
import type { MemberRole } from "#/api/group";
import { Button } from "#/components/ui";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { AvatarBadge } from "./AvatarBadge";
import { ChatComposer } from "./ChatComposer";
import { ChatHeaderMenu } from "./ChatHeaderMenu";
import { MessageBubble } from "./MessageBubble";

export type ChatHeader = {
  name: string;
  initials: string;
  hue: number;
  subtitle?: string;
};

export type ChatMessageView = {
  id: number;
  content: string;
  createdAt: string;
  mine: boolean;
};

export type ChatThreadState =
  | "open"
  | "incoming_pending"
  | "outgoing_pending"
  | "blocked"
  | "blocked_by_peer";

export function ChatPane({
  header,
  messages,
  sending,
  threadState = "open",
  conversationType = "DIRECT",
  myRole,
  error,
  onBack,
  onSend,
  onBlock,
  onUnblock,
  onHide,
  onLeave,
  onAddMembers,
  onDeleteMessage,
}: {
  header: ChatHeader;
  messages: ChatMessageView[];
  sending?: boolean;
  threadState?: ChatThreadState;
  conversationType?: ConversationType;
  myRole?: MemberRole | null;
  error?: string | null;
  onBack: () => void;
  onSend: (content: string) => void;
  onBlock?: () => void;
  onUnblock?: () => void;
  onHide?: () => void;
  onLeave?: () => void;
  onAddMembers?: () => void;
  onDeleteMessage?: (id: number) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  const blocked = threadState === "blocked";
  const blockedByPeer = threadState === "blocked_by_peer";
  const pending = threadState === "incoming_pending";
  const waiting = threadState === "outgoing_pending";
  const canCompose = !blocked && !blockedByPeer;
  const uniqueMessages = messages.filter(
    (item, index, list) =>
      list.findIndex((other) => Number(other.id) === Number(item.id)) === index,
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [uniqueMessages.length]);

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-[var(--chat-pane)]">
      <header className="flex items-center gap-3 border-b border-white/6 px-3 py-3 md:px-5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 rounded-full text-white/70 hover:bg-white/8 md:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <AvatarBadge
          initials={header.initials}
          hue={header.hue}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {header.name}
          </p>
          <p className="text-[11px] text-white/40">
            {header.subtitle ?? "Direct"}
          </p>
        </div>
        <ChatHeaderMenu
          type={conversationType}
          myRole={myRole}
          blocked={blocked}
          disabled={sending}
          onBlock={onBlock}
          onUnblock={onUnblock}
          onHide={onHide}
          onLeave={onLeave}
          onAddMembers={onAddMembers}
        />
      </header>

      <div className="chat-canvas chat-scroll min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          {pending ? (
            <div className="mb-3 rounded-2xl bg-amber-400/8 px-4 py-3 text-sm text-amber-100/90 ring-1 ring-amber-300/15">
              Đây là tin nhắn chờ. Trả lời để kết bạn, hoặc chặn nếu không muốn
              nhận tin.
            </div>
          ) : null}
          {waiting ? (
            <div className="mb-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/55 ring-1 ring-white/8">
              Đã gửi lời mời. Đối phương sẽ thấy tin nhắn chờ cho đến khi họ trả
              lời hoặc chặn bạn.
            </div>
          ) : null}
          {uniqueMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onDelete={onDeleteMessage}
            />
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {error ? (
        <p className="px-4 pb-1 text-center text-xs text-red-300">{error}</p>
      ) : null}

      {blocked ? (
        <div className="border-t border-white/6 px-4 py-4 text-center">
          <p className="text-sm text-white/60">Bạn đã chặn người này</p>
          {onUnblock ? (
            <Button
              type="button"
              className="mt-3 h-9 rounded-xl bg-white/10 px-4 text-white hover:bg-white/16"
              onClick={onUnblock}
              disabled={sending}
            >
              Bỏ chặn
            </Button>
          ) : null}
        </div>
      ) : blockedByPeer ? (
        <div className="border-t border-white/6 px-4 py-4 text-center">
          <p className="text-sm text-white/50">Không thể nhắn tin với người này</p>
        </div>
      ) : canCompose ? (
        <ChatComposer
          onSend={onSend}
          disabled={sending}
          placeholder={
            pending ? "Trả lời để chấp nhận kết bạn..." : undefined
          }
        />
      ) : null}
    </section>
  );
}
