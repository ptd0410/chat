import { useChatThread } from "#/modules/conversation";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  isConversationPane,
  isSettingsDetail,
  tabFromPathname,
  type NavTab,
} from "./nav.config";
import { useNavStore } from "./nav.store";

export function useNavTab() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return tabFromPathname(pathname);
}

export function useHasPane() {
  const { hasThread } = useChatThread();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return hasThread || isConversationPane(pathname) || isSettingsDetail(pathname);
}

export function useRememberThread() {
  const { conversationId, directUserId } = useChatThread();
  const rememberThread = useNavStore((s) => s.rememberThread);

  useEffect(() => {
    if (conversationId != null) {
      rememberThread({
        to: "/conversation/$id",
        params: { id: String(conversationId) },
      });
      return;
    }
    if (directUserId != null) {
      rememberThread({
        to: "/direct/$userId",
        params: { userId: String(directUserId) },
      });
    }
  }, [conversationId, directUserId, rememberThread]);
}

export function useOpenNavTab() {
  const navigate = useNavigate();
  const tab = useNavTab();
  const lastThread = useNavStore((s) => s.lastThread);

  function openTab(next: NavTab) {
    if (next === tab) return;
    if (next === "conversations") {
      if (lastThread) {
        void navigate(lastThread);
        return;
      }
      void navigate({ to: "/" });
      return;
    }
    if (next === "contacts") {
      void navigate({ to: "/contacts" });
      return;
    }
    if (next === "calls") {
      void navigate({ to: "/calls" });
      return;
    }
    void navigate({ to: "/settings" });
  }

  return { tab, openTab };
}
