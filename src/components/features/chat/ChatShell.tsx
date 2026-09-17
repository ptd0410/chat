import { useIsAuth } from "#/modules/auth";
import {
  refreshInbox,
  useChatThread,
  useConversationUiStore,
  useOpenConversation,
} from "#/modules/conversation";
import { cn } from "#/lib";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AddFriendDialog } from "./AddFriendDialog";
import { ConversationList } from "./ConversationList";
import { CreateGroupDialog } from "./CreateGroupDialog";

export function ChatShell({ children }: { children?: ReactNode }) {
  const { hasThread } = useChatThread();
  const composer = useConversationUiStore((s) => s.composer);
  const closeComposer = useConversationUiStore((s) => s.closeComposer);
  const { select, openDirect } = useOpenConversation();

  return (
    <div className="relative flex size-full overflow-hidden bg-[var(--chat-list)]">
      <div
        className={cn(
          "h-full w-full md:w-auto md:shrink-0",
          hasThread ? "hidden md:flex" : "flex",
        )}
      >
        <ConversationList />
      </div>
      <div
        className={cn(
          "h-full min-w-0 flex-1",
          hasThread ? "flex" : "hidden md:flex",
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

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuth } = useIsAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth) {
      void navigate({ to: "/login" });
    }
  }, [isAuth, navigate]);

  if (!isAuth) return null;
  return children;
}
