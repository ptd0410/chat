import { AvatarBadge, SidebarHeader, listRowClass } from "#/components/features/shared";
import { Button } from "#/components/ui";
import { hueFromId, initialsFromName } from "#/lib";
import { useLogout, useMe } from "#/modules/auth";
import { SETTINGS_PATHS } from "#/modules/nav";
import { useMatchRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight, LogOut, Settings2, Shield, type LucideIcon } from "lucide-react";

const ITEMS: {
  to: typeof SETTINGS_PATHS.general | typeof SETTINGS_PATHS.privacy;
  label: string;
  description: string;
  icon: LucideIcon;
  fuzzy?: boolean;
}[] = [
  {
    to: SETTINGS_PATHS.general,
    label: "Chung",
    description: "Giao diện và trải nghiệm chat",
    icon: Settings2,
  },
  {
    to: SETTINGS_PATHS.privacy,
    label: "Quyền riêng tư",
    description: "Tin nhắn chờ và chặn người dùng",
    icon: Shield,
    fuzzy: true,
  },
];

export function SettingsList() {
  const { data } = useMe();
  const logout = useLogout();
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const meName = data?.profile?.name ?? data?.uid ?? "Bạn";
  const meHue = hueFromId(data?.id ?? 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SidebarHeader title="Cài đặt" />
      <div className="chat-scroll min-h-0 flex-1 overflow-y-auto py-1">
        <button
          type="button"
          onClick={() => void navigate({ to: SETTINGS_PATHS.account })}
          className={listRowClass(
            Boolean(matchRoute({ to: SETTINGS_PATHS.account })),
          )}
        >
          <AvatarBadge
            initials={initialsFromName(meName)}
            hue={meHue}
            src={data?.profile?.avatar}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-white">
              {meName}
            </span>
            <span className="mt-0.5 block truncate text-[13px] text-white/40">
              {data?.email ?? "Xem hồ sơ của bạn"}
            </span>
          </span>
          <ChevronRight className="size-4 text-white/30" />
        </button>

        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = Boolean(
            matchRoute({ to: item.to, fuzzy: item.fuzzy }),
          );
          return (
            <button
              key={item.to}
              type="button"
              onClick={() => void navigate({ to: item.to })}
              className={listRowClass(active)}
            >
              <span className="grid size-11 place-items-center rounded-full bg-white/6 text-teal-300">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white/90">
                  {item.label}
                </span>
                <span className="mt-0.5 block truncate text-[13px] text-white/40">
                  {item.description}
                </span>
              </span>
              <ChevronRight className="size-4 text-white/30" />
            </button>
          );
        })}

        <div className="px-3 py-4">
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-full justify-start gap-3 rounded-xl px-3 text-red-300 hover:bg-red-400/10 hover:text-red-200"
            onClick={() => logout.mutate()}
          >
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
}
