import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "#/lib";

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
  );
}

function PopoverContent({
  className,
  align = "end",
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-48 origin-(--radix-popover-content-transform-origin) overflow-hidden rounded-xl border border-white/10 bg-[#15212c] p-1 text-white shadow-2xl outline-none",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverItem({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"button"> & {
  variant?: "default" | "destructive";
}) {
  return (
    <button
      type="button"
      data-slot="popover-item"
      data-variant={variant}
      className={cn(
        "flex w-full cursor-default items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-white/90 outline-none select-none hover:bg-white/8 disabled:pointer-events-none disabled:opacity-40 data-[variant=destructive]:text-red-300 data-[variant=destructive]:hover:bg-red-400/10 data-[variant=destructive]:hover:text-red-200 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function PopoverSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-separator"
      className={cn("my-1 h-px bg-white/8", className)}
      {...props}
    />
  );
}

export { Popover, PopoverContent, PopoverItem, PopoverSeparator, PopoverTrigger };
