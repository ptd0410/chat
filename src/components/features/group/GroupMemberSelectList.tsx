import type { GroupMemberResponse } from "#/api/group";
import { hueFromId, initialsFromName } from "#/lib";
import { groupRoleLabel } from "#/modules/group";
import { AvatarBadge } from "#/components/features/shared";

export function GroupMemberSelectList({
  members,
  selectedId,
  onSelect,
  disabled,
}: {
  members: GroupMemberResponse[];
  selectedId: number | null;
  onSelect: (userId: number) => void;
  disabled?: boolean;
}) {
  if (members.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-white/40">
        Không còn thành viên nào để chọn.
      </p>
    );
  }

  return (
    <div className="chat-scroll min-h-0 flex-1 overflow-y-auto">
      {members.map((member) => {
        const name = member.user.name || member.user.email || "Người dùng";
        const selected = selectedId === member.userId;
        return (
          <button
            key={member.userId}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(member.userId)}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/5 disabled:opacity-50"
          >
            <span
              className={`grid size-4 place-items-center rounded-full border ${
                selected ? "border-teal-300 bg-teal-400" : "border-white/25"
              }`}
            />
            <AvatarBadge
              initials={initialsFromName(name)}
              hue={hueFromId(member.userId)}
              size="sm"
              src={member.user.avatar}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-white">{name}</span>
              <span className="block truncate text-[11px] text-white/40">
                {groupRoleLabel(member.role)}
                {member.user.email ? ` · ${member.user.email}` : ""}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
