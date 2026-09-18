import { ConversationDetail } from "#/components/features/conversation";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_chat/conversation/$id/detail")({
  component: ConversationDetailRoute,
});

function ConversationDetailRoute() {
  const { id } = Route.useParams();
  const conversationId = Number(id);
  if (Number.isNaN(conversationId)) {
    return <Navigate to="/" />;
  }
  return <ConversationDetail conversationId={conversationId} />;
}
