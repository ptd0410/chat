import { cn } from "#/lib";
import { Bookmark } from "lucide-react";
import type { ReactNode } from "react";

export function AvatarBadge({
  initials,
  hue,
  size = "md",
  online,
  saved,
  src,
}: {
  initials: string;
  hue: number;
  size?: "sm" | "md" | "lg" | "xl";
  online?: boolean;
  saved?: boolean;
  src?: string | null;
}) {
  const dim =
    size === "xl"
      ? "size-20 text-2xl"
      : size === "lg"
        ? "size-12 text-[15px]"
        : size === "sm"
          ? "size-9 text-xs"
          : "size-11 text-[13px]";
  const icon: ReactNode =
    size === "xl" ? (
      <Bookmark className="size-9" fill="currentColor" />
    ) : size === "lg" ? (
      <Bookmark className="size-6" fill="currentColor" />
    ) : size === "sm" ? (
      <Bookmark className="size-4" fill="currentColor" />
    ) : (
      <Bookmark className="size-5" fill="currentColor" />
    );

  return (
    <span className="relative shrink-0">
      <span
        className={cn(
          "grid place-items-center overflow-hidden rounded-full font-semibold tracking-wide",
          dim,
          saved ? "bg-teal-400 text-teal-950" : "text-white",
        )}
        style={
          saved
            ? undefined
            : {
                background: `linear-gradient(145deg, oklch(0.62 0.14 ${hue}), oklch(0.42 0.1 ${hue}))`,
              }
        }
      >
        {saved ? (
          icon
        ) : src ? (
          <img
            src={src}
            alt=""
            referrerPolicy="no-referrer"
            className="size-full object-cover"
          />
        ) : (
          initials
        )}
      </span>
      {online ? (
        <span className="absolute right-0 bottom-0 size-3 rounded-full bg-emerald-400 ring-2 ring-[var(--chat-list)]" />
      ) : null}
    </span>
  );
}
