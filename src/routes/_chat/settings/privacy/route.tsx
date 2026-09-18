import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_chat/settings/privacy")({
  component: PrivacyLayout,
});

function PrivacyLayout() {
  return <Outlet />;
}
