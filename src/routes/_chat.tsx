import { ChatShell, RequireAuth } from "#/components";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_chat")({
  component: ChatLayout,
});

function ChatLayout() {
  return (
    <RequireAuth>
      <ChatShell>
        <Outlet />
      </ChatShell>
    </RequireAuth>
  );
}
