import { SETTINGS_PATHS } from "#/modules/nav";
import { useBlockedUsers } from "#/modules/contact";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { SettingsCard, SettingsPane } from "./SettingsPane";

export function PrivacySettings() {
  const navigate = useNavigate();
  const { data: blocked = [] } = useBlockedUsers();

  return (
    <SettingsPane
      title="Quyền riêng tư"
      description="Cách người khác có thể liên hệ với bạn"
    >
      <SettingsCard title="Tin nhắn">
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-white">Tin nhắn chờ</p>
          <p className="mt-1 text-sm leading-relaxed text-white/45">
            Người chưa có trong danh bạ vẫn có thể gửi tin. Những tin đó vào mục
            Tin nhắn chờ cho đến khi bạn trả lời hoặc chặn.
          </p>
        </div>
      </SettingsCard>

      <SettingsCard title="Chặn">
        <button
          type="button"
          onClick={() => void navigate({ to: SETTINGS_PATHS.blocked })}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/4"
        >
          <span>
            <span className="block text-sm font-medium text-white">
              Người bị chặn
            </span>
            <span className="mt-1 block text-sm text-white/45">
              Họ không thể nhắn tin cho bạn.
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-2 text-sm text-white/50">
            {blocked.length}
            <ChevronRight className="size-4 text-white/30" />
          </span>
        </button>
      </SettingsCard>
    </SettingsPane>
  );
}
