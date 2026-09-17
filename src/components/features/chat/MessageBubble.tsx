import { cn, formatMessageTime } from "#/lib";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "#/components/ui";
import { Check, Copy, Trash2 } from "lucide-react";
import type { ChatMessageView } from "./ChatPane";

export function MessageBubble({
  message,
  onDelete,
}: {
  message: ChatMessageView;
  onDelete?: (id: number) => void;
}) {
  const mine = message.mine;

  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={cn(
              "max-w-[min(72%,34rem)] rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed shadow-[0_8px_24px_-18px_black]",
              mine
                ? "rounded-br-md bg-teal-400 text-teal-950"
                : "rounded-bl-md bg-white/8 text-white ring-1 ring-white/6",
            )}
          >
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
