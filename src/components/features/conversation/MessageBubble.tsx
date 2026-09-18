import { cn, formatMessageTime } from "#/lib";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "#/components/ui";
import { Check, Copy, Reply, Trash2 } from "lucide-react";
import type { ChatMessageView } from "./conversation.view";

export function MessageBubble({
  message,
  highlighted,
  onDelete,
  onReply,
  onJumpToReply,
}: {
  message: ChatMessageView;
  highlighted?: boolean;
  onDelete?: (id: number) => void;
  onReply?: (message: ChatMessageView) => void;
  onJumpToReply?: (id: number) => void;
}) {
  const mine = message.mine;
  const quote = message.replyTo;

  return (
    <div
      id={`message-${message.id}`}
      className={cn(
        "group relative flex scroll-mt-4 items-center gap-1.5",
        mine ? "justify-end" : "justify-start",
      )}
    >
      {onReply ? (
        <ReplyButton side={mine ? "left" : "right"} onClick={() => onReply(message)} />
      ) : null}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            onDoubleClick={() => onReply?.(message)}
            className={cn(
              "max-w-[min(72%,34rem)] rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed shadow-[0_8px_24px_-18px_black] transition-shadow",
              mine
                ? "rounded-br-md bg-teal-400 text-teal-950"
                : "rounded-bl-md bg-white/8 text-white ring-1 ring-white/6",
              highlighted &&
                (mine
                  ? "ring-2 ring-teal-200/80"
                  : "ring-2 ring-teal-300/70"),
            )}
          >
            {quote ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (quote.deleted) return;
                  onJumpToReply?.(quote.id);
                }}
                className={cn(
                  "mb-1.5 w-full rounded-lg border-l-2 px-2 py-1 text-left",
                  mine
                    ? "border-teal-900/45 bg-teal-950/10"
                    : "border-teal-400/80 bg-black/20",
                  quote.deleted ? "cursor-default" : "cursor-pointer",
                )}
              >
                <p
                  className={cn(
                    "truncate text-[11px] font-semibold",
                    mine ? "text-teal-900/80" : "text-teal-300",
                  )}
                >
                  {quote.senderName}
                </p>
                <p
                  className={cn(
                    "line-clamp-2 text-[12px]",
                    mine ? "text-teal-950/70" : "text-white/55",
                    quote.deleted && "italic",
                  )}
                >
                  {quote.deleted ? "Tin nhắn đã xóa" : quote.content}
                </p>
              </button>
            ) : null}
            <p className="whitespace-pre-wrap">{message.content}</p>
            <p
              className={cn(
                "mt-1 flex items-center justify-end gap-1 text-[10px]",
                mine ? "text-teal-900/70" : "text-white/35",
              )}
            >
              {formatMessageTime(message.createdAt)}
              {mine ? <Check className="size-3.5" /> : null}
            </p>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {onReply ? (
            <ContextMenuItem onSelect={() => onReply(message)}>
              <Reply />
              Trả lời
            </ContextMenuItem>
          ) : null}
          <ContextMenuItem
            onSelect={() => {
              void navigator.clipboard.writeText(message.content);
            }}
          >
            <Copy />
            Sao chép
          </ContextMenuItem>
          {mine && onDelete ? (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem
                variant="destructive"
                onSelect={() => onDelete(message.id)}
              >
                <Trash2 />
                Xóa
              </ContextMenuItem>
            </>
          ) : null}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

function ReplyButton({
  onClick,
  side,
}: {
  onClick: () => void;
  side: "left" | "right";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Trả lời"
      className={cn(
        "absolute top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full text-white/40 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/8 hover:text-white md:inline-flex",
        side === "left" ? "right-full mr-1" : "left-full ml-1",
      )}
    >
      <Reply className="size-4" />
    </button>
  );
}
