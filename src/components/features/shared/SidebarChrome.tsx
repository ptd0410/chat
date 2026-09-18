import { cn } from "#/lib";
import { Search } from "lucide-react";
import type { ReactNode } from "react";

export function SidebarHeader({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-3">
      <div>
        <p className="text-[11px] font-medium tracking-[0.18em] text-teal-300/80 uppercase">
          Halo
        </p>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-white">
          {title}
        </h1>
      </div>
      {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
    </div>
  );
}

export function SidebarSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="px-3 pb-3">
      <label className="flex h-10 items-center gap-2 rounded-xl bg-white/6 px-3 ring-1 ring-white/6 focus-within:ring-teal-400/40">
        <Search className="size-4 text-white/35" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
        />
      </label>
    </div>
  );
}

export function SidebarEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="px-4 py-8 text-center text-sm text-white/40">{children}</p>
  );
}

export function listRowClass(active?: boolean) {
  return cn(
    "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
    active ? "bg-white/8" : "hover:bg-white/4",
  );
}
