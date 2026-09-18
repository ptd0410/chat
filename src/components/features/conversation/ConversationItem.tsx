import {
  useConversationItem,
  type ConversationListItem,
} from "#/modules/conversation";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "#/components/ui";
import { cn, formatChatTime } from "#/lib";
import { Ban, LogOut, MessageSquare, Trash2 } from "lucide-react";
import { AvatarBadge } from "#/components/features/shared";

export function ConversationItem({
  conversation,
}: {
  conversation: ConversationListItem;
}) {
  const { active, select, block, unblock, leave, hide } =
    useConversationItem(conversation);
  const isDirect = conversation.type === "DIRECT";
  const blocked = conversation.blockStatus === "blocked";

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          onClick={select}
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
            active ? "bg-white/8" : "hover:bg-white/4",
          )}
        >
          <AvatarBadge
            initials={conversation.initials}
            hue={conversation.hue}
            saved={conversation.type === "SAVED"}
            src={conversation.peerAvatar}
          />
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-sm font-medium text-white/90">
                  {conversation.name}
                </span>
                {conversation.type === "SAVED" ? (
                  <span className="shrink-0 rounded-md bg-teal-400/15 px-1.5 py-0.5 text-[10px] text-teal-200">
                    Đã lưu
                  </span>
                ) : conversation.type === "GROUP" ? (
                  <span className="shrink-0 rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] text-teal-300/90">
                    Nhóm
                  </span>
                ) : conversation.relation === "incoming_pending" ? (
                  <span className="shrink-0 rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[10px] text-amber-200">
                    Chờ
                  </span>
                ) : blocked ? (
                  <span className="shrink-0 rounded-md bg-red-400/15 px-1.5 py-0.5 text-[10px] text-red-200">
                    Đã chặn
                  </span>
                ) : null}
              </span>
              {conversation.lastMessageAt ? (
                <span className="shrink-0 text-[11px] text-white/35">
                  {formatChatTime(conversation.lastMessageAt)}
                </span>
              ) : null}
            </span>
            <span className="mt-0.5 block truncate text-[13px] text-white/40">
              {conversation.preview}
            </span>
          </span>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={select}>
          <MessageSquare />
          Mở
        </ContextMenuItem>
        {isDirect && block && !blocked ? (
          <ContextMenuItem variant="destructive" onSelect={block}>
            <Ban />
            Chặn
          </ContextMenuItem>
        ) : null}
        {isDirect && unblock && blocked ? (
          <ContextMenuItem onSelect={unblock}>
            <Ban />
            Bỏ chặn
          </ContextMenuItem>
        ) : null}
        {conversation.type === "GROUP" && leave ? (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive" onSelect={leave}>
              <LogOut />
              Rời nhóm
            </ContextMenuItem>
          </>
        ) : null}
        {isDirect && hide ? (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive" onSelect={hide}>
              <Trash2 />
              Xóa đoạn chat
            </ContextMenuItem>
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
}
