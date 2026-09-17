import {
  Button,
  Popover,
  PopoverContent,
  PopoverItem,
  PopoverSeparator,
  PopoverTrigger,
} from "#/components/ui";
import type { ConversationType } from "#/api/conversation";
import type { MemberRole } from "#/api/group";
import { Ban, EllipsisVertical, LogOut, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";

function groupRoleLabel(role: MemberRole | null) {
  if (role === "OWNER") return "Chủ nhóm";
  if (role === "ADMIN") return "Quản trị viên";
  return "Thành viên";
}

export function ChatHeaderMenu({
  type,
  myRole,
  blocked,
  disabled,
  onBlock,
  onUnblock,
  onHide,
  onLeave,
  onAddMembers,
}: {
  type: ConversationType;
  myRole?: MemberRole | null;
  blocked?: boolean;
  disabled?: boolean;
  onBlock?: () => void;
  onUnblock?: () => void;
  onHide?: () => void;
  onLeave?: () => void;
  onAddMembers?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isGroup = type === "GROUP";
  const isStaff = myRole === "OWNER" || myRole === "ADMIN";
  const showAddMembers = isGroup && isStaff && Boolean(onAddMembers);
  const showLeave = isGroup && Boolean(onLeave);
  const showBlock = !isGroup && !blocked && Boolean(onBlock);
  const showUnblock = !isGroup && Boolean(blocked) && Boolean(onUnblock);
  const showHide = !isGroup && Boolean(onHide);
  const hasPrimary = showAddMembers || showBlock || showUnblock;
  const hasDanger = showHide || showLeave;
  const hasActions = hasPrimary || hasDanger;

  if (!hasActions) return null;

  function run(action?: () => void) {
    setOpen(false);
    action?.();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 rounded-full text-white/70 hover:bg-white/8 hover:text-white"
          disabled={disabled}
          aria-label="Tùy chọn hội thoại"
        >
          <EllipsisVertical className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="px-2.5 py-1.5 text-[11px] tracking-wide text-white/40 uppercase">
          {isGroup ? groupRoleLabel(myRole ?? null) : "Tin nhắn"}
        </p>
        {showAddMembers ? (
          <PopoverItem onClick={() => run(onAddMembers)}>
            <UserPlus />
            Thêm thành viên
          </PopoverItem>
        ) : null}
        {showBlock ? (
          <PopoverItem variant="destructive" onClick={() => run(onBlock)}>
            <Ban />
            Chặn
          </PopoverItem>
        ) : null}
        {showUnblock ? (
          <PopoverItem onClick={() => run(onUnblock)}>
            <Ban />
            Bỏ chặn
          </PopoverItem>
        ) : null}
        {hasPrimary && hasDanger ? <PopoverSeparator /> : null}
        {showHide ? (
          <PopoverItem variant="destructive" onClick={() => run(onHide)}>
            <Trash2 />
            Xóa đoạn chat
          </PopoverItem>
        ) : null}
        {showLeave ? (
          <PopoverItem variant="destructive" onClick={() => run(onLeave)}>
            <LogOut />
            Rời nhóm
          </PopoverItem>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
