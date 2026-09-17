import { LoadingScreen } from "#/components";
import { useAuthStore } from "#/modules/auth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

type GoogleCallbackSearch = {
  accessToken?: string;
  refreshToken?: string;
  error?: string;
};

export const Route = createFileRoute("/auth/google-callback")({
  validateSearch: (search: Record<string, unknown>): GoogleCallbackSearch => ({
    accessToken:
      typeof search.accessToken === "string" ? search.accessToken : undefined,
    refreshToken:
      typeof search.refreshToken === "string" ? search.refreshToken : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { accessToken, refreshToken, error } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (error || !accessToken || !refreshToken) {
      void navigate({ to: "/login" });
      return;
    }

    useAuthStore.setState({
      accessToken,
      refreshToken,
    });
    void navigate({ to: "/" });
  }, [accessToken, error, navigate, refreshToken]);

  return <LoadingScreen />;
}
