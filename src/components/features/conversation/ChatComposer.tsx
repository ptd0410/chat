import { Button } from "#/components/ui";
import { Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type ComposerReply = {
  senderName: string;
  content: string;
};

export function ChatComposer({
  onSend,
  disabled,
  placeholder = "Nhắn một điều gì đó...",
  replyTo,
  onClearReply,
}: {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  replyTo?: ComposerReply | null;
  onClearReply?: () => void;
}) {
  const [value, setValue] = useState("");
  const sendingRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled) sendingRef.current = false;
  }, [disabled]);

  useEffect(() => {
    if (!replyTo) return;
    inputRef.current?.focus();
  }, [replyTo]);

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
      className="border-t border-white/6 bg-[var(--chat-pane)] px-3 py-3 md:px-4"
    >
      {replyTo ? (
        <div className="mb-2 flex items-start gap-2 rounded-xl bg-white/6 px-3 py-2 ring-1 ring-white/8">
          <div className="min-w-0 flex-1 border-l-2 border-teal-400 pl-2.5">
            <p className="truncate text-xs font-semibold text-teal-300">
              Trả lời{" "}
              {replyTo.senderName === "Bạn" ? "chính bạn" : replyTo.senderName}
            </p>
            <p className="truncate text-xs text-white/50">
              {replyTo.content || "Tin nhắn"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 rounded-full text-white/50 hover:bg-white/8 hover:text-white"
            onClick={onClearReply}
            aria-label="Hủy trả lời"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : null}
      <div className="flex items-end gap-2 rounded-2xl bg-white/6 px-3 py-2 ring-1 ring-white/8 focus-within:ring-teal-400/35">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && replyTo) {
              e.preventDefault();
              onClearReply?.();
              return;
            }
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
