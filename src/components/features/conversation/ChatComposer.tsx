import { Button } from "#/components/ui";
import type { ChatMessageView } from "#/modules/conversation";
import { usePendingFiles } from "#/modules/draft";
import { Check, Paperclip, Pencil, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PendingFileList } from "./PendingFileList";

export function ChatComposer({
  onSend,
  onEdit,
  disabled,
  placeholder = "Nhắn một điều gì đó...",
  replyTo = null,
  editTo = null,
  onClearReply,
  onClearEdit,
}: {
  onSend: (content: string, files: File[]) => void | Promise<void>;
  onEdit?: (content: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  replyTo?: ChatMessageView | null;
  editTo?: ChatMessageView | null;
  onClearReply?: () => void;
  onClearEdit?: () => void;
}) {
  const [value, setValue] = useState("");
  const sendingRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const editingIdRef = useRef<number | null>(null);
  const editing = Boolean(editTo);
  const editId = editTo?.id ?? null;
  const editContent = editTo?.content ?? "";
  const { files, fileError, addFiles, removeFile, clearFiles } = usePendingFiles(
    { disabled, editing },
  );

  useEffect(() => {
    if (!disabled) sendingRef.current = false;
  }, [disabled]);

  useEffect(() => {
    if (editId != null) {
      editingIdRef.current = editId;
      setValue(editContent);
      clearFiles();
      inputRef.current?.focus();
      return;
    }
    if (editingIdRef.current != null) {
      editingIdRef.current = null;
      setValue("");
    }
  }, [editId, editContent]);

  useEffect(() => {
    if (!replyTo || editTo) return;
    inputRef.current?.focus();
  }, [replyTo, editTo]);

  async function submit() {
    const content = value.trim();
    if (disabled || sendingRef.current) return;
    if (editing) {
      if (!content && !editTo?.attachments.length) return;
      sendingRef.current = true;
      try {
        await onEdit?.(content);
      } catch {
        sendingRef.current = false;
      }
      return;
    }
    if (!content && files.length === 0) return;
    sendingRef.current = true;
    try {
      await onSend(
        content,
        files.map((item) => item.file),
      );
      setValue("");
      clearFiles();
    } catch {
      sendingRef.current = false;
    }
  }

  const canSend = editing
    ? Boolean(value.trim() || editTo?.attachments.length)
    : Boolean(value.trim() || files.length);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        addFiles(e.dataTransfer.files);
      }}
      className="border-t border-white/6 bg-[var(--chat-pane)] px-3 py-3 md:px-4"
    >
      {editTo ? (
        <div className="mb-2 flex items-start gap-2 rounded-xl bg-white/6 px-3 py-2 ring-1 ring-white/8">
          <div className="min-w-0 flex-1 border-l-2 border-teal-400 pl-2.5">
            <p className="flex items-center gap-1 truncate text-xs font-semibold text-teal-300">
              <Pencil className="size-3.5" />
              Chỉnh sửa tin nhắn
            </p>
            <p className="truncate text-xs text-white/50">
              {editTo.content || "Tin nhắn"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 rounded-full text-white/50 hover:bg-white/8 hover:text-white"
            onClick={onClearEdit}
            aria-label="Hủy chỉnh sửa"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : replyTo ? (
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
      <PendingFileList files={files} onRemove={removeFile} />
      {fileError ? (
        <p className="mb-2 text-xs text-red-300">{fileError}</p>
      ) : null}
      <div className="flex items-end gap-2 rounded-2xl bg-white/6 px-2 py-2 ring-1 ring-white/8 focus-within:ring-teal-400/35">
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {editing ? null : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="size-10 shrink-0 rounded-xl text-white/60 hover:bg-white/8 hover:text-white"
            onClick={() => fileRef.current?.click()}
            aria-label="Đính kèm tệp"
          >
            <Paperclip className="size-4" />
          </Button>
        )}
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && (editTo || replyTo)) {
              e.preventDefault();
              if (editTo) onClearEdit?.();
              else onClearReply?.();
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
          placeholder={editing ? "Sửa tin nhắn..." : placeholder}
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/30 disabled:opacity-50"
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || !canSend}
          className="size-10 shrink-0 rounded-xl bg-teal-400 text-teal-950 hover:bg-teal-300 disabled:opacity-40"
          aria-label={editing ? "Lưu" : "Gửi"}
        >
          {editing ? <Check className="size-4" /> : <Send className="size-4" />}
        </Button>
      </div>
    </form>
  );
}
