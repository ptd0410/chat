import { CallList } from "#/components/features/calls";
import { ContactList } from "#/components/features/contact";
import { ConversationList } from "#/components/features/conversation";
import { SettingsList } from "#/components/features/settings";
import { useNavTab } from "#/modules/nav";
import { BottomNav } from "./BottomNav";

export function AppSidebar() {
  const tab = useNavTab();

  return (
    <aside className="relative flex h-full w-full flex-col border-r border-white/10 bg-[var(--chat-list)] md:w-[360px] md:shrink-0">
      {tab === "conversations" ? <ConversationList /> : null}
      {tab === "contacts" ? <ContactList /> : null}
      {tab === "calls" ? <CallList /> : null}
      {tab === "settings" ? <SettingsList /> : null}
      <BottomNav />
    </aside>
  );
}
