import { apiClient, queryClient } from "#/clients";
import { authQueryKey, useAuthStore } from "#/modules/auth";
import { Button } from "#/components/ui";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.8-4.1 2.8-7 0-.7-.1-1.4-.2-2H12Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.6 0 4.8-.9 6.4-2.4l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.6-1.7-5.4-4l-3.2 2.5C5.2 19.8 8.4 22 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.6 14.1c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9L3.4 7.8C2.5 9.6 2 11.2 2 12.2c0 1.6.4 3.2 1.4 4.4l3.2-2.5Z"
      />
      <path
        fill="#4285F4"
        d="M12 5.9c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.8 2.9 14.6 2 12 2 8.4 2 5.2 4.2 3.4 7.8l3.2 2.5C7.4 7.6 9.5 5.9 12 5.9Z"
      />
    </svg>
  );
}

function googleOAuthUrl() {
  const base = apiClient.defaults.baseURL ?? "";
  return `${base}/auth/login/google?popup=1`;
}

function openOAuthPopup(url: string) {
  const width = 480;
  const height = 680;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  window.open(
    url,
    "google-auth",
    `width=${width},height=${height},left=${left},top=${top}`,
  );
}

export function GoogleLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data;
      if (data?.type !== "google-auth") return;
      if (!data?.accessToken || !data?.refreshToken) return;

      useAuthStore.setState({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      void queryClient.invalidateQueries({ queryKey: authQueryKey.me });
      void navigate({ to: "/" });
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigate]);

  return (
    <Button
      type="button"
      variant="social"
      size="xl"
      className="w-full"
      onClick={() => openOAuthPopup(googleOAuthUrl())}
    >
      <GoogleIcon />
      Tiếp tục với Google
    </Button>
  );
}
