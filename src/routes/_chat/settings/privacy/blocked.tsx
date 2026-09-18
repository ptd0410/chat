import { BlockedSettings } from "#/components/features/settings";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_chat/settings/privacy/blocked")({
  component: BlockedSettings,
});
