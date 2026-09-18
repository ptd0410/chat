import { useOpenNavTab, type NavTab } from "#/modules/nav";
import { cn } from "#/lib";
import { MessageCircle, Phone, Settings, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TABS: { id: NavTab; label: string; icon: LucideIcon }[] = [
  { id: "conversations", label: "Tin nhắn", icon: MessageCircle },
  { id: "contacts", label: "Danh bạ", icon: Users },
  { id: "calls", label: "Gọi", icon: Phone },
  { id: "settings", label: "Cài đặt", icon: Settings },
];

export function BottomNav() {
  const { tab, openTab } = useOpenNavTab();

  return (
    <nav className="grid shrink-0 grid-cols-4 border-t border-white/6 bg-[var(--chat-list)] px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {TABS.map((item) => {
        const active = item.id === tab;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => openTab(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-colors",
              active
                ? "text-teal-300"
                : "text-white/40 hover:bg-white/5 hover:text-white/75",
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
