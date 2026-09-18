import { useIsAuth } from "#/modules/auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuth } = useIsAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth) {
      void navigate({ to: "/login" });
    }
  }, [isAuth, navigate]);

  if (!isAuth) return null;
  return children;
}
