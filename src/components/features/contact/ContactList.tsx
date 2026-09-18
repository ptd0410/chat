import type { ContactItemResponse } from "#/api/contact";
import {
  AvatarBadge,
  SidebarEmpty,
  SidebarHeader,
  SidebarSearch,
  listRowClass,
} from "#/components/features/shared";
import { Button } from "#/components/ui";
import { hueFromId, initialsFromName } from "#/lib";
import { useContacts } from "#/modules/contact";
import { useConversationUiStore, useOpenConversation } from "#/modules/conversation";
import { UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

export function ContactList() {
  const { data: contacts = [], isLoading } = useContacts();
  const openComposer = useConversationUiStore((s) => s.openComposer);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((item) => {
      const name = item.user.name ?? "";
      const email = item.user.email ?? "";
      return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
    });
  }, [contacts, query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SidebarHeader
        title="Danh bạ"
        actions={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-full text-white/70 hover:bg-white/8 hover:text-white"
            onClick={() => openComposer("friend")}
          >
            <UserPlus className="size-4" />
          </Button>
        }
      />
      <SidebarSearch
        value={query}
        onChange={setQuery}
        placeholder="Tìm bạn bè"
      />
      <div className="chat-scroll min-h-0 flex-1 overflow-y-auto py-1">
        {isLoading ? (
          <SidebarEmpty>Đang tải danh bạ...</SidebarEmpty>
        ) : filtered.length === 0 ? (
          <SidebarEmpty>
            {query.trim()
              ? "Không tìm thấy liên hệ phù hợp."
              : "Chưa có bạn bè. Thêm bạn để bắt đầu trò chuyện."}
          </SidebarEmpty>
        ) : (
          filtered.map((contact) => (
            <ContactItem key={contact.id} contact={contact} />
          ))
        )}
      </div>
    </div>
  );
}

function ContactItem({ contact }: { contact: ContactItemResponse }) {
  const { openDirect } = useOpenConversation();
  const name = contact.user.name || contact.user.email || "Người dùng";

  return (
    <button
      type="button"
      onClick={() => openDirect(contact.user.id)}
      className={listRowClass()}
    >
      <AvatarBadge
        initials={initialsFromName(name)}
        hue={hueFromId(contact.user.id)}
        src={contact.user.avatar}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-white/90">
          {name}
        </span>
        <span className="mt-0.5 block truncate text-[13px] text-white/40">
          {contact.user.bio?.trim() || contact.user.email || contact.user.phone || ""}
        </span>
      </span>
    </button>
  );
}
