import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_chat/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  return <Outlet />;
}
