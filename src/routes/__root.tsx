import { Outlet, createRootRoute } from "@tanstack/react-router";
import { BootstrapProvider, QueryProvider } from "#/components";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <QueryProvider>
      <BootstrapProvider>
        <div className="h-dvh w-dvw overflow-hidden">
          <Outlet />
        </div>
      </BootstrapProvider>
    </QueryProvider>
  );
}
