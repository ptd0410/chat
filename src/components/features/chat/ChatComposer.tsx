import { Button } from "#/components/ui";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ChatComposer({
  onSend,
  disabled,
  placeholder = "Nhắn một điều gì đó...",
}: {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const sendingRef = useRef(false);

  useEffect(() => {
    if (!disabled) sendingRef.current = false;
  }, [disabled]);

  function submit() {
    const content = value.trim();
    if (!content || disabled || sendingRef.current) return;
    sendingRef.current = true;
    onSend(content);
    setValue("");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="border-t border-white/6 bg-[var(--chat-pane)] px-4 py-3"
    >
      <div className="flex items-end gap-2 rounded-2xl bg-white/6 px-3 py-2 ring-1 ring-white/8 focus-within:ring-teal-400/35">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.stopPropagation();
              submit();
            }
          }}
          rows={1}
          disabled={disabled}
          placeholder={placeholder}
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/30 disabled:opacity-50"
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || !value.trim()}
          className="size-10 shrink-0 rounded-xl bg-teal-400 text-teal-950 hover:bg-teal-300 disabled:opacity-40"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </form>
  );
}
