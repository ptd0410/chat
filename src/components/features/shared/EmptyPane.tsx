import type { LucideIcon } from "lucide-react";

export function EmptyPane({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="chat-canvas relative flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="mb-5 grid size-16 place-items-center rounded-2xl bg-white/6 ring-1 ring-white/10">
        <Icon className="size-7 text-teal-300" />
      </div>
      <h2 className="font-heading text-2xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/45">
        {description}
      </p>
    </div>
  );
}
