import { ChatPane } from "#/components/features/conversation";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_chat/conversation/$id/")({
  component: ConversationRoute,
});

function ConversationRoute() {
  return <ChatPane />;
}
