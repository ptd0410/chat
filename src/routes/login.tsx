import { LoginForm } from "#/components";
import { useIsAuth } from "#/modules/auth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const { isAuth } = useIsAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuth) {
      void navigate({ to: "/" });
    }
  }, [isAuth, navigate]);

  return (
    <div className="size-full p-4">
      <LoginForm />
    </div>
  );
}
