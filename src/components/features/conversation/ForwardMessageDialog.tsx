import { AvatarBadge, InfiniteScrollSentinel } from "#/components/features/shared";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui";
import { useForwardMessage } from "#/modules/action";
import type { ChatMessageView } from "#/modules/conversation";
import { Forward } from "lucide-react";

export function ForwardMessageDialog({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: ChatMessageView | null;
  onClose: () => void;
}) {
  const {
    query,
    setQuery,
    selected,
    error,
    targets,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    sending,
    preview,
    loadMore,
    toggle,
    submit,
    close,
  } = useForwardMessage({ message, onClose });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent className="flex max-h-[min(32rem,calc(100vh-5rem))] flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Forward className="size-4 text-teal-300" />
            Chuyển tiếp
          </DialogTitle>
          <DialogDescription className="sr-only">
            Chọn hội thoại để chuyển tiếp tin nhắn.
          </DialogDescription>
        </DialogHeader>

        <p className="line-clamp-2 rounded-xl bg-white/6 px-3 py-2 text-xs text-white/55">
          {preview}
        </p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm hội thoại"
          className="h-10 rounded-xl bg-white/6 px-3 text-sm text-white outline-none ring-1 ring-white/8 placeholder:text-white/30 focus:ring-teal-400/40"
        />

        <div className="chat-scroll min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="py-6 text-center text-sm text-white/40">
              Đang tải hội thoại...
            </p>
          ) : targets.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/40">
              Không có hội thoại để chuyển tiếp.
            </p>
          ) : (
            targets.map((item) => {
              const checked = selected.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/5"
                >
                  <span
                    className={`grid size-4 shrink-0 place-items-center rounded border ${
                      checked
                        ? "border-teal-300 bg-teal-400"
                        : "border-white/25"
                    }`}
                  />
                  <AvatarBadge
                    initials={item.initials}
                    hue={item.hue}
                    size="sm"
                    saved={item.type === "SAVED"}
                    src={item.peerAvatar}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-white">
                      {item.name}
                    </span>
                    <span className="block truncate text-[11px] text-white/40">
                      {item.type === "GROUP"
                        ? `${item.memberCount} thành viên`
                        : item.type === "SAVED"
                          ? "Chỉ mình bạn thấy"
                          : item.preview}
                    </span>
                  </span>
                </button>
              );
            })
          )}
          <InfiniteScrollSentinel
            enabled={Boolean(hasNextPage)}
            loading={isFetchingNextPage}
            onLoadMore={loadMore}
          />
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <Button
          type="button"
          disabled={sending || selected.length === 0}
          onClick={() => void submit()}
          className="h-10 rounded-xl bg-teal-400 text-teal-950 hover:bg-teal-300"
        >
          {selected.length > 1
            ? `Chuyển tiếp (${selected.length})`
            : "Chuyển tiếp"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
