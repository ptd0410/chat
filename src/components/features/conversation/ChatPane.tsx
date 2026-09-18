import { AddMembersDialog } from "#/components/features/group";
import { AvatarBadge } from "#/components/features/shared";
import { Button } from "#/components/ui";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate } from "@tanstack/react-router";
import { ChatComposer } from "./ChatComposer";
import { ChatHeaderMenu } from "./ChatHeaderMenu";
import { MessageBubble } from "./MessageBubble";
import { useChatPane } from "./useChatPane";

export function ChatPane() {
  const pane = useChatPane();
  const [addingMembers, setAddingMembers] = useState(false);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blocked = pane.threadState === "blocked";
  const blockedByPeer = pane.threadState === "blocked_by_peer";
  const pending = pane.threadState === "incoming_pending";
  const waiting = pane.threadState === "outgoing_pending";
  const canCompose = !blocked && !blockedByPeer;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pane.messages.length]);

  useEffect(() => {
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, []);

  function jumpToMessage(id: number) {
    const target = document.getElementById(`message-${id}`);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedId(id);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => {
      setHighlightedId(null);
    }, 1400);
  }

  if (pane.missing) {
    return <Navigate to="/" />;
  }

  if (pane.redirectId != null) {
    return (
      <Navigate
        to="/conversation/$id"
        params={{ id: String(pane.redirectId) }}
      />
    );
  }

  const identity = (
    <>
      <AvatarBadge
        initials={pane.header.initials}
        hue={pane.header.hue}
        size="sm"
        saved={pane.conversationType === "SAVED"}
        src={pane.header.avatar}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {pane.header.name}
        </p>
        <p className="text-[11px] text-white/40">
          {pane.header.subtitle ?? "Direct"}
        </p>
      </div>
    </>
  );

  return (
    <>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--chat-pane)]">
        <header className="flex items-center gap-3 border-b border-white/6 px-3 py-3 md:px-5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-full text-white/70 hover:bg-white/8 md:hidden"
            onClick={pane.goHome}
          >
            <ArrowLeft className="size-4" />
          </Button>
          {pane.goDetail ? (
            <button
              type="button"
              onClick={pane.goDetail}
              className="-ml-1 flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1 py-1 text-left hover:bg-white/6"
              aria-label={`Xem thông tin ${pane.header.name}`}
            >
              {identity}
              <ChevronRight className="size-4 shrink-0 text-white/30" />
            </button>
          ) : (
            identity
          )}
          <div className="shrink-0">
            <ChatHeaderMenu
              type={pane.conversationType}
              myRole={pane.myRole}
              blocked={blocked}
              disabled={pane.sending}
              onViewInfo={pane.goDetail}
              onBlock={pane.block}
              onUnblock={pane.unblock}
              onHide={pane.hide}
              onLeave={pane.leave}
              onAddMembers={
                pane.canAddMembers
                  ? () => setAddingMembers(true)
                  : undefined
              }
            />
          </div>
        </header>

        <div className="chat-canvas chat-scroll min-h-0 flex-1 overflow-y-auto px-3 py-5 md:px-4">
          <div className="flex flex-col gap-2">
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
            {pane.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                highlighted={highlightedId === message.id}
                onDelete={pane.deleteMessage}
                onReply={canCompose ? pane.startReply : undefined}
                onJumpToReply={jumpToMessage}
              />
            ))}
            <div ref={endRef} />
          </div>
        </div>

        {pane.error ? (
          <p className="px-3 pb-1 text-center text-xs text-red-300 md:px-4">
            {pane.error}
          </p>
        ) : null}

        {blocked ? (
          <div className="border-t border-white/6 px-3 py-4 text-center md:px-4">
            <p className="text-sm text-white/60">Bạn đã chặn người này</p>
            {pane.unblock ? (
              <Button
                type="button"
                className="mt-3 h-9 rounded-xl bg-white/10 px-4 text-white hover:bg-white/16"
                onClick={pane.unblock}
                disabled={pane.sending}
              >
                Bỏ chặn
              </Button>
            ) : null}
          </div>
        ) : blockedByPeer ? (
          <div className="border-t border-white/6 px-3 py-4 text-center md:px-4">
            <p className="text-sm text-white/50">
              Không thể nhắn tin với người này
            </p>
          </div>
        ) : canCompose ? (
          <ChatComposer
            onSend={pane.sendMessage}
            disabled={pane.sending}
            replyTo={pane.replyingTo}
            onClearReply={pane.clearReply}
            placeholder={
              pane.conversationType === "SAVED"
                ? "Ghi chú cho riêng bạn..."
                : pending
                  ? "Trả lời để chấp nhận kết bạn..."
                  : undefined
            }
          />
        ) : null}
      </section>
      {pane.isGroup && pane.conversationId != null ? (
        <AddMembersDialog
          open={addingMembers}
          groupId={pane.conversationId}
          existingUserIds={pane.existingUserIds}
          onClose={() => setAddingMembers(false)}
        />
      ) : null}
    </>
  );
}
