import type { ReactNode } from "react";

export function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[560px] overflow-hidden rounded-2xl bg-background ring-1 ring-foreground/10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_circle_at_0%_0%,color-mix(in_oklch,var(--primary),transparent_88%),transparent_55%),radial-gradient(900px_circle_at_100%_100%,color-mix(in_oklch,var(--primary),transparent_90%),transparent_50%)]"
      />
      <div className="relative z-10 grid h-full w-full grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="hidden flex-col justify-between p-10 lg:flex xl:p-14">
          <span className="text-sm font-semibold tracking-wide">Chat</span>
          <div className="max-w-md space-y-3">
            <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
              Welcome
            </p>
            <h2 className="font-heading text-4xl leading-[1.15] font-semibold text-balance">
              Nhắn tin nhanh, gọn
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Đăng nhập Google để bắt đầu hội thoại.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Đăng nhập an toàn với Google
          </p>
        </aside>
        <div className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md rounded-2xl bg-card/90 p-6 shadow-xl ring-1 ring-foreground/10 backdrop-blur-md sm:p-8">
            <div className="mb-6 lg:hidden">
              <span className="text-sm font-semibold">Chat</span>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <h1 className="font-heading text-2xl font-semibold tracking-tight">
                  Đăng nhập
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Dùng tài khoản Google để vào chat.
                </p>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
