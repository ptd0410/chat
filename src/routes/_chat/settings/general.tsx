import { GeneralSettings } from "#/components/features/settings";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_chat/settings/general")({
  component: GeneralSettings,
});
