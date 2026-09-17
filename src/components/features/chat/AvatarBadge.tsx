import { cn } from "#/lib";

export function AvatarBadge({
  initials,
  hue,
  size = "md",
  online,
}: {
  initials: string;
  hue: number;
  size?: "sm" | "md" | "lg";
  online?: boolean;
}) {
  const dim =
    size === "lg" ? "size-12 text-[15px]" : size === "sm" ? "size-9 text-xs" : "size-11 text-[13px]";

  return (
    <span className="relative shrink-0">
      <span
        className={cn(
          "grid place-items-center rounded-full font-semibold tracking-wide text-white",
          dim,
        )}
        style={{
          background: `linear-gradient(145deg, oklch(0.62 0.14 ${hue}), oklch(0.42 0.1 ${hue}))`,
        }}
      >
        {initials}
      </span>
      {online ? (
        <span className="absolute right-0 bottom-0 size-3 rounded-full bg-emerald-400 ring-2 ring-[var(--chat-list)]" />
      ) : null}
    </span>
  );
}
