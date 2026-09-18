import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_chat/conversation/$id")({
  component: ConversationLayout,
});

function ConversationLayout() {
  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <Outlet />
    </div>
  );
}
