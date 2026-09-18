import {
  refreshInbox,
  useConversationUiStore,
  useOpenConversation,
} from "#/modules/conversation";
import { AddFriendDialog } from "#/components/features/contact";
import { CreateGroupDialog } from "#/components/features/group";
import { useHasPane, useRememberThread } from "#/modules/nav";
import { cn } from "#/lib";
import { Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

export function ChatShell({ children }: { children?: ReactNode }) {
  const hasPane = useHasPane();
  const composer = useConversationUiStore((s) => s.composer);
  const closeComposer = useConversationUiStore((s) => s.closeComposer);
  const { select, openDirect } = useOpenConversation();
  useRememberThread();

  return (
    <div className="relative flex size-full overflow-hidden bg-[var(--chat-list)]">
      <div
        className={cn(
          "h-full w-full md:w-auto md:shrink-0",
          hasPane ? "hidden md:flex" : "flex",
        )}
      >
        <AppSidebar />
      </div>
      <div
        className={cn(
          "h-full min-w-0 flex-1",
          hasPane ? "flex" : "hidden md:flex",
        )}
      >
        {children ?? <Outlet />}
      </div>
      <AddFriendDialog
        open={composer === "friend"}
        onClose={closeComposer}
        onMessage={(userId) => {
          refreshInbox();
          openDirect(userId);
        }}
      />
      <CreateGroupDialog
        open={composer === "group"}
        onClose={closeComposer}
        onCreated={(groupId) => {
          refreshInbox();
          select(groupId);
        }}
      />
    </div>
  );
}
