import type { BlockedUserResponse } from "#/api/contact";
import { Button } from "#/components/ui";
import { AvatarBadge } from "#/components/features/shared";
import { apiErrorMessage, hueFromId, initialsFromName } from "#/lib";
import { useBlockedUsers, useUnblockUser } from "#/modules/contact";
import { SettingsCard, SettingsPane } from "./SettingsPane";

export function BlockedSettings() {
  const { data: blocked = [], isLoading } = useBlockedUsers();
  const unblock = useUnblockUser();
  const error = unblock.error
    ? apiErrorMessage(unblock.error, "Không bỏ chặn được")
    : null;

  return (
    <SettingsPane
      title="Người bị chặn"
      description="Bỏ chặn để họ có thể nhắn tin lại"
      backTo="/settings/privacy"
    >
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <SettingsCard>
        {isLoading ? (
          <p className="px-4 py-6 text-center text-sm text-white/40">
            Đang tải danh sách chặn...
          </p>
        ) : blocked.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-white/40">
            Bạn chưa chặn ai.
          </p>
        ) : (
          blocked.map((row) => (
            <BlockedRow
              key={row.id}
              row={row}
              pending={unblock.isPending}
              onUnblock={() => unblock.mutate(row.user.id)}
            />
          ))
        )}
      </SettingsCard>
    </SettingsPane>
  );
}

function BlockedRow({
  row,
  pending,
  onUnblock,
}: {
  row: BlockedUserResponse;
  pending: boolean;
  onUnblock: () => void;
}) {
  const name = row.user.name || row.user.email || "Người dùng";

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <AvatarBadge
        initials={initialsFromName(name)}
        hue={hueFromId(row.user.id)}
        size="sm"
        src={row.user.avatar}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{name}</p>
        {row.user.email ? (
          <p className="truncate text-xs text-white/40">{row.user.email}</p>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        className="h-8 rounded-lg px-3 text-teal-200 hover:bg-white/8 hover:text-white"
        disabled={pending}
        onClick={onUnblock}
      >
        Bỏ chặn
      </Button>
    </div>
  );
}
