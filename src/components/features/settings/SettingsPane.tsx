import { Button } from "#/components/ui";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

export function SettingsPane({
  title,
  description,
  backTo = "/settings",
  children,
}: {
  title: string;
  description?: string;
  backTo?: "/settings" | "/settings/privacy";
  children: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-[var(--chat-pane)]">
      <header className="flex items-center gap-3 border-b border-white/6 px-3 py-3 md:px-5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 rounded-full text-white/70 hover:bg-white/8"
          onClick={() => void navigate({ to: backTo })}
          aria-label="Quay lại"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          {description ? (
            <p className="text-[11px] text-white/40">{description}</p>
          ) : null}
        </div>
      </header>
      <div className="chat-canvas chat-scroll min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-8">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4">{children}</div>
      </div>
    </section>
  );
}

export function SettingsCard({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/8">
      {title ? (
        <p className="px-4 pt-3 pb-1 text-[11px] tracking-wide text-white/40 uppercase">
          {title}
        </p>
      ) : null}
      {children}
    </section>
  );
}

export function SettingsField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <p className="text-sm text-white/45">{label}</p>
      <p className="min-w-0 text-right text-sm font-medium wrap-break-word text-white">
        {value}
      </p>
    </div>
  );
}

export function SettingsFormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5 px-4 py-3">
      <span className="text-sm text-white/45">{label}</span>
      {children}
    </label>
  );
}
