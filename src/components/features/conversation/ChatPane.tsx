import { AddMembersDialog, LeaveGroupDialog, TransferOwnerDialog } from "#/components/features/group";
import { AvatarBadge } from "#/components/features/shared";
import { Button } from "#/components/ui";
import { useChatActions } from "#/modules/action";
import {
  useChatScroll,
  useChatThreadData,
  type ChatMessageView,
} from "#/modules/conversation";
import { useChatDraft } from "#/modules/draft";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Navigate } from "@tanstack/react-router";
import { ChatComposer } from "./ChatComposer";
import { ChatHeaderMenu } from "./ChatHeaderMenu";
import { ForwardMessageDialog } from "./ForwardMessageDialog";
import { MessageBubble } from "./MessageBubble";

export function ChatPane() {
  const thread = useChatThreadData();
  const draft = useChatDraft({
    conversationId: thread.conversationId,
    directUserId: thread.directUserId,
    messages: thread.messagesReady ? thread.messages : null,
  });
  const actions = useChatActions(thread);
  const [addingMembers, setAddingMembers] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [forwarding, setForwarding] = useState<ChatMessageView | null>(null);
  const scroll = useChatScroll({
    conversationId: thread.conversationId,
    messages: thread.messages,
    hasOlder: thread.hasOlder,
    loadingOlder: thread.loadingOlder,
    loadOlder: thread.loadOlder,
  });

  if (thread.missing) {
    return <Navigate to="/" />;
  }

  if (thread.redirectId != null) {
    return (
      <Navigate
        to="/conversation/$id"
        params={{ id: String(thread.redirectId) }}
      />
    );
  }

  const identity = (
    <>
      <AvatarBadge
        initials={thread.header.initials}
        hue={thread.header.hue}
        size="sm"
        saved={thread.conversationType === "SAVED"}
        src={thread.header.avatar}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {thread.header.name}
        </p>
        <p className="text-[11px] text-white/40">
          {thread.header.subtitle ?? "Direct"}
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
            onClick={actions.goHome}
          >
            <ArrowLeft className="size-4" />
          </Button>
          {actions.goDetail ? (
            <button
              type="button"
              onClick={actions.goDetail}
              className="-ml-1 flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1 py-1 text-left hover:bg-white/6"
              aria-label={`Xem thông tin ${thread.header.name}`}
            >
              {identity}
              <ChevronRight className="size-4 shrink-0 text-white/30" />
            </button>
          ) : (
            identity
          )}
          <div className="shrink-0">
            <ChatHeaderMenu
              type={thread.conversationType}
              myRole={thread.myRole}
              blocked={thread.blocked}
              disabled={actions.sending}
              onViewInfo={actions.goDetail}
              onBlock={actions.block}
              onUnblock={actions.unblock}
              onHide={actions.hide}
              onLeave={thread.isGroup ? () => setLeaving(true) : undefined}
              onTransferOwner={
                thread.canTransferOwner
                  ? () => setTransferring(true)
                  : undefined
              }
              onAddMembers={
                thread.canAddMembers
                  ? () => setAddingMembers(true)
                  : undefined
              }
            />
          </div>
        </header>

        <div
          ref={scroll.scrollerRef}
          className="chat-canvas chat-scroll min-h-0 flex-1 overflow-y-auto px-3 py-5 md:px-4"
        >
          <div className="flex flex-col gap-2">
            {thread.pending ? (
              <div className="mb-3 rounded-2xl bg-amber-400/8 px-4 py-3 text-sm text-amber-100/90 ring-1 ring-amber-300/15">
                Đây là tin nhắn chờ. Trả lời để kết bạn, hoặc chặn nếu không muốn
                nhận tin.
              </div>
            ) : null}
            {thread.waiting ? (
              <div className="mb-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/55 ring-1 ring-white/8">
                Đã gửi lời mời. Đối phương sẽ thấy tin nhắn chờ cho đến khi họ trả
                lời hoặc chặn bạn.
              </div>
            ) : null}
            {thread.hasOlder || thread.loadingOlder ? (
              <div
                ref={scroll.olderSentinelRef}
                className="py-1 text-center text-[11px] text-white/35"
              >
                {thread.loadingOlder ? "Đang tải tin nhắn cũ..." : null}
              </div>
            ) : null}
            {thread.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                highlighted={scroll.highlightedId === message.id}
                onDelete={actions.deleteMessage}
                onReply={thread.canCompose ? draft.startReply : undefined}
                onForward={setForwarding}
                onEdit={thread.canCompose ? draft.startEdit : undefined}
                onReact={
                  thread.canCompose && actions.reactMessage
                    ? (emoji) => actions.reactMessage?.(message.id, emoji)
                    : undefined
                }
                onJumpToReply={scroll.jumpToMessage}
              />
            ))}
            <div ref={scroll.endRef} />
          </div>
        </div>

        {actions.error ? (
          <p className="px-3 pb-1 text-center text-xs text-red-300 md:px-4">
            {actions.error}
          </p>
        ) : null}

        {thread.blocked ? (
          <div className="border-t border-white/6 px-3 py-4 text-center md:px-4">
            <p className="text-sm text-white/60">Bạn đã chặn người này</p>
            {actions.unblock ? (
              <Button
                type="button"
                className="mt-3 h-9 rounded-xl bg-white/10 px-4 text-white hover:bg-white/16"
                onClick={actions.unblock}
                disabled={actions.sending}
              >
                Bỏ chặn
              </Button>
            ) : null}
          </div>
        ) : thread.blockedByPeer ? (
          <div className="border-t border-white/6 px-3 py-4 text-center md:px-4">
            <p className="text-sm text-white/50">
              Không thể nhắn tin với người này
            </p>
          </div>
        ) : thread.canCompose ? (
          <ChatComposer
            onSend={actions.sendMessage}
            onEdit={actions.editMessage}
            replyTo={draft.replyTo}
            editTo={draft.editing}
            onClearReply={draft.clearReply}
            onClearEdit={draft.clearEdit}
            disabled={actions.sending}
            placeholder={
              thread.conversationType === "SAVED"
                ? "Ghi chú cho riêng bạn..."
                : thread.pending
                  ? "Trả lời để chấp nhận kết bạn..."
                  : undefined
            }
          />
        ) : null}
      </section>
      {thread.isGroup && thread.conversationId != null ? (
        <>
          <AddMembersDialog
            open={addingMembers}
            groupId={thread.conversationId}
            existingUserIds={thread.existingUserIds}
            onClose={() => setAddingMembers(false)}
          />
          <LeaveGroupDialog
            open={leaving}
            groupId={thread.conversationId}
            groupName={thread.header.name}
            myRole={thread.myRole}
            memberCount={thread.memberCount}
            onClose={() => setLeaving(false)}
          />
          {thread.canTransferOwner ? (
            <TransferOwnerDialog
              open={transferring}
              groupId={thread.conversationId}
              onClose={() => setTransferring(false)}
            />
          ) : null}
        </>
      ) : null}
      <ForwardMessageDialog
        open={forwarding != null}
        message={forwarding}
        onClose={() => setForwarding(null)}
      />
    </>
  );
}
