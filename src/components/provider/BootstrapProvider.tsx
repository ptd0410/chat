import { useAuthStore, useAutoToken } from "#/modules/auth";
import { useRealtimeSocket } from "#/modules/realtime";
import { type PropsWithChildren, useEffect, useState } from "react";
import { LoadingScreen } from "../layout";

export function BootstrapProvider({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    void useAuthStore.persist.rehydrate();
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  if (!hydrated) return <LoadingScreen />;
  return <TokenBootstrap>{children}</TokenBootstrap>;
}

function TokenBootstrap({ children }: PropsWithChildren) {
  const { isFetched } = useAutoToken();
  const accessToken = useAuthStore((s) => s.accessToken);
  useRealtimeSocket(isFetched ? accessToken : "");
  if (!isFetched) return <LoadingScreen />;
  return children;
}
