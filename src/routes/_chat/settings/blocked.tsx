import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_chat/settings/blocked")({
  beforeLoad: () => {
    throw redirect({ to: "/settings/privacy/blocked" });
  },
  component: () => null,
});
