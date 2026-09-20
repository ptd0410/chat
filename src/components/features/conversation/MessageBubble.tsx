import { MESSAGE_REACTION_EMOJIS, type MessageAttachment } from "#/api/message";
import { cn, formatMessageTime } from "#/lib";
import { formatFileSize } from "#/modules/file-storage";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui";
import { Check, Copy, Download, FileText, Forward, Pencil, Reply, SmilePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ChatMessageView, ChatReactionView } from "#/modules/conversation";

export function MessageBubble({
  message,
  highlighted,
  onDelete,
  onReply,
  onForward,
  onEdit,
  onReact,
  onJumpToReply,
}: {
  message: ChatMessageView;
  highlighted?: boolean;
  onDelete?: (id: number) => void;
  onReply?: (message: ChatMessageView) => void;
  onForward?: (message: ChatMessageView) => void;
  onEdit?: (message: ChatMessageView) => void;
  onReact?: (emoji: string) => void;
  onJumpToReply?: (id: number) => void;
}) {
  const mine = message.mine;
  const quote = message.replyTo;
  const forwardFrom = message.forwardFrom;
  const copyText =
    message.content ||
    message.attachments.map((item) => item.name).join("\n") ||
    "";

  return (
    <div
      id={`message-${message.id}`}
      className={cn(
        "group relative flex scroll-mt-4 flex-col gap-1",
        mine ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "relative flex items-center gap-1.5",
          mine ? "justify-end" : "justify-start",
        )}
      >
        {onReply || onReact ? (
          <HoverActions
            side={mine ? "left" : "right"}
            onReply={onReply ? () => onReply(message) : undefined}
            onReact={onReact}
            reactedEmojis={message.reactions
              .filter((item) => item.reacted)
              .map((item) => item.emoji)}
          />
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
              {forwardFrom ? (
                <p
                  className={cn(
                    "mb-1 flex items-center gap-1 text-[11px] font-semibold",
                    mine ? "text-teal-900/80" : "text-teal-300",
                  )}
                >
                  <Forward className="size-3.5 shrink-0" />
                  <span className="truncate">
                    Chuyển tiếp từ {forwardFrom.senderName}
                  </span>
                </p>
              ) : null}
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
                    {quote.deleted
                      ? "Tin nhắn đã xóa"
                      : quote.content || "Tin nhắn"}
                  </p>
                </button>
              ) : null}
              {message.attachments.length ? (
                <MessageAttachments attachments={message.attachments} mine={mine} />
              ) : null}
              {message.content ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : null}
              <p
                className={cn(
                  "mt-1 flex items-center justify-end gap-1 text-[10px]",
                  mine ? "text-teal-900/70" : "text-white/35",
                )}
              >
                {formatMessageTime(message.createdAt)}
                {message.edited ? <span>đã sửa</span> : null}
                {mine ? <Check className="size-3.5" /> : null}
              </p>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {onReact ? (
              <>
                <div className="flex items-center gap-0.5 px-0.5 py-0.5">
                  {MESSAGE_REACTION_EMOJIS.map((emoji) => {
                    const reacted = message.reactions.some(
                      (item) => item.emoji === emoji && item.reacted,
                    );
                    return (
                      <ContextMenuItem
                        key={emoji}
                        className={cn(
                          "size-8 justify-center p-0 text-base",
                          reacted && "bg-teal-400/20 ring-1 ring-teal-300/40",
                        )}
                        onSelect={() => onReact(emoji)}
                      >
                        {emoji}
                      </ContextMenuItem>
                    );
                  })}
                </div>
                <ContextMenuSeparator />
              </>
            ) : null}
            {onReply ? (
              <ContextMenuItem onSelect={() => onReply(message)}>
                <Reply />
                Trả lời
              </ContextMenuItem>
            ) : null}
            {onForward ? (
              <ContextMenuItem onSelect={() => onForward(message)}>
                <Forward />
                Chuyển tiếp
              </ContextMenuItem>
            ) : null}
            {mine && onEdit ? (
              <ContextMenuItem onSelect={() => onEdit(message)}>
                <Pencil />
                Chỉnh sửa
              </ContextMenuItem>
            ) : null}
            {copyText ? (
              <ContextMenuItem
                onSelect={() => {
                  void navigator.clipboard.writeText(copyText);
                }}
              >
                <Copy />
                Sao chép
              </ContextMenuItem>
            ) : null}
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
      {message.reactions.length ? (
        <ReactionChips
          reactions={message.reactions}
          mine={mine}
          onReact={onReact}
        />
      ) : null}
    </div>
  );
}

function chipClass(reacted: boolean, clickable: boolean) {
  return cn(
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[13px] leading-none ring-1",
    reacted
      ? "bg-teal-400/20 text-white ring-teal-300/40"
      : "bg-white/8 text-white/80 ring-white/10",
    clickable && "cursor-pointer hover:bg-white/12",
  );
}

function MessageAttachments({
  attachments,
  mine,
}: {
  attachments: MessageAttachment[];
  mine: boolean;
}) {
  return (
    <div className="mb-1.5 flex flex-col gap-2">
      {attachments.map((item) => {
        if (item.type === "PHOTO" || item.mime?.startsWith("image/")) {
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-xl"
            >
              <img
                src={item.url}
                alt={item.name}
                className="max-h-72 w-full object-cover"
              />
            </a>
          );
        }
        if (item.type === "VIDEO" || item.mime?.startsWith("video/")) {
          return (
            <video
              key={item.id}
              src={item.url}
              controls
              className="max-h-72 w-full rounded-xl"
            />
          );
        }
        if (item.type === "AUDIO" || item.mime?.startsWith("audio/")) {
          return <audio key={item.id} src={item.url} controls className="w-full" />;
        }
        return (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            download={item.name}
            className={cn(
              "flex items-center gap-2 rounded-xl px-2.5 py-2 ring-1",
              mine
                ? "bg-teal-950/10 ring-teal-900/20"
                : "bg-black/20 ring-white/8",
            )}
          >
            <FileText className="size-5 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{item.name}</span>
              <span
                className={cn(
                  "block text-[11px]",
                  mine ? "text-teal-900/70" : "text-white/45",
                )}
              >
                {formatFileSize(item.size) || "Tệp"}
              </span>
            </span>
            <Download className="size-4 shrink-0 opacity-70" />
          </a>
        );
      })}
    </div>
  );
}

function ReplyButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Trả lời"
      className="inline-flex size-8 items-center justify-center rounded-full text-white/40 hover:bg-white/8 hover:text-white"
    >
      <Reply className="size-4" />
    </button>
  );
}

function HoverActions({
  side,
  onReply,
  onReact,
  reactedEmojis,
}: {
  side: "left" | "right";
  onReply?: () => void;
  onReact?: (emoji: string) => void;
  reactedEmojis: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "absolute top-1/2 z-10 hidden -translate-y-1/2 items-center pointer-events-none opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 md:flex",
        open && "pointer-events-auto opacity-100",
        side === "left" ? "right-full mr-1" : "left-full ml-1",
      )}
    >
      {onReply ? <ReplyButton onClick={onReply} /> : null}
      {onReact ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Bày tỏ cảm xúc"
              className="inline-flex size-8 items-center justify-center rounded-full text-white/40 hover:bg-white/8 hover:text-white"
            >
              <SmilePlus className="size-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align={side === "left" ? "end" : "start"}
            side="top"
            className="min-w-0 w-auto p-1.5"
          >
            <ReactionEmojiRow
              reactedEmojis={reactedEmojis}
              onReact={(emoji) => {
                onReact(emoji);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
}

function ReactionEmojiRow({
  reactedEmojis,
  onReact,
}: {
  reactedEmojis: string[];
  onReact: (emoji: string) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 px-0.5 py-0.5">
      {MESSAGE_REACTION_EMOJIS.map((emoji) => {
        const reacted = reactedEmojis.includes(emoji);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onReact(emoji)}
            aria-label={reacted ? `Bỏ ${emoji}` : `Thả ${emoji}`}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-lg text-base transition-transform hover:scale-110 hover:bg-white/8",
              reacted && "bg-teal-400/20 ring-1 ring-teal-300/40",
            )}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}

function ReactionChips({
  reactions,
  mine,
  onReact,
}: {
  reactions: ChatReactionView[];
  mine: boolean;
  onReact?: (emoji: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex max-w-[min(72%,34rem)] flex-wrap gap-1 px-1",
        mine ? "justify-end" : "justify-start",
      )}
    >
      {reactions.map((item) =>
        onReact ? (
          <button
            key={item.emoji}
            type="button"
            onClick={() => onReact(item.emoji)}
            aria-label={item.reacted ? `Bỏ ${item.emoji}` : `Thả ${item.emoji}`}
            className={chipClass(item.reacted, true)}
          >
            <span>{item.emoji}</span>
            <span className="text-[11px] tabular-nums text-white/60">
              {item.count}
            </span>
          </button>
        ) : (
          <span key={item.emoji} className={chipClass(item.reacted, false)}>
            <span>{item.emoji}</span>
            <span className="text-[11px] tabular-nums text-white/60">
              {item.count}
            </span>
          </span>
        ),
      )}
    </div>
  );
}
