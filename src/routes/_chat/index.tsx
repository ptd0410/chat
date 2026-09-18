import { EmptyChat } from "#/components/features/conversation";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_chat/")({
  component: EmptyChat,
});
