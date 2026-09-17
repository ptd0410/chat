import { EmptyChat } from "#/components/features/chat/EmptyChat";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_chat/")({
  component: EmptyChat,
});
