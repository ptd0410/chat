import type { ContactSearchResponse } from "#/api/contact";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui";
import { apiErrorMessage } from "#/lib";
import {
  useAddContact,
  useSearchContact,
  useUnblockUser,
} from "#/modules/contact";
import { UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";

export function AddFriendDialog({
  open,
  onClose,
  onMessage,
}: {
  open: boolean;
  onClose: () => void;
  onMessage: (userId: number) => void;
}) {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<ContactSearchResponse | null>(null);
  const search = useSearchContact();
  const add = useAddContact();
  const unblock = useUnblockUser();

  function reset() {
    setEmail("");
    setResult(null);
    search.reset();
    add.reset();
    unblock.reset();
  }

  function close() {
    reset();
    onClose();
  }

  function handleOpenChange(next: boolean) {
    if (!next) close();
  }

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setResult(null);
    add.reset();
    unblock.reset();
    try {
      setResult(await search.mutateAsync({ email: value }));
    } catch {
      setResult(null);
    }
  }

  async function onAdd() {
    if (!result || result.blockedByMe) return;
    try {
      const contact = await add.mutateAsync({ userId: result.id });
      setResult({ ...contact.user, alreadyContact: true, blockedByMe: false });
      onMessage(result.id);
      close();
    } catch {
      /* shown below */
    }
  }

  async function onStartChat() {
    if (!result || result.blockedByMe) return;
    try {
      if (!result.alreadyContact) {
        await add.mutateAsync({ userId: result.id });
      }
      onMessage(result.id);
      close();
    } catch {
      /* shown below */
    }
  }

  async function onUnblock() {
    if (!result) return;
    try {
      await unblock.mutateAsync(result.id);
      setResult({ ...result, blockedByMe: false, alreadyContact: false });
    } catch {
      /* shown below */
    }
  }

  const error = search.error
    ? apiErrorMessage(search.error, "Không tìm thấy người dùng")
    : add.error
      ? apiErrorMessage(add.error, "Không thêm được bạn")
      : unblock.error
        ? apiErrorMessage(unblock.error, "Không bỏ chặn được")
        : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-4 text-teal-300" />
            Thêm bạn
          </DialogTitle>
          <DialogDescription className="sr-only">
            Tìm người dùng theo email để thêm bạn hoặc bắt đầu trò chuyện.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSearch} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="h-10 min-w-0 flex-1 rounded-xl bg-white/6 px-3 text-sm text-white outline-none ring-1 ring-white/8 placeholder:text-white/30 focus:ring-teal-400/40"
          />
          <Button
            type="submit"
            disabled={search.isPending || !email.trim()}
            className="h-10 rounded-xl bg-teal-400 px-3 text-teal-950 hover:bg-teal-300"
          >
            Tìm
          </Button>
        </form>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        {result ? (
          <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/8">
            <p className="truncate text-sm font-medium text-white">
              {result.name || "Người dùng"}
            </p>
            <p className="truncate text-xs text-white/45">{result.email}</p>
            {result.bio?.trim() ? (
              <p className="mt-1 line-clamp-2 text-xs text-white/50">
                {result.bio.trim()}
              </p>
            ) : null}
            {result.phone?.trim() ? (
              <p className="truncate text-xs text-white/40">{result.phone.trim()}</p>
            ) : null}
            {result.blockedByMe ? (
              <p className="mt-2 text-xs text-red-300/90">Bạn đã chặn người này</p>
            ) : null}
            <div className="mt-3 flex gap-2">
              {result.blockedByMe ? (
                <Button
                  type="button"
                  onClick={() => void onUnblock()}
                  disabled={unblock.isPending}
                  className="h-9 flex-1 rounded-xl bg-white/10 text-white hover:bg-white/16"
                >
                  Bỏ chặn
                </Button>
              ) : result.alreadyContact ? (
                <p className="flex-1 self-center text-xs text-teal-300/80">
                  Đã là bạn
                </p>
              ) : (
                <Button
                  type="button"
                  onClick={() => void onAdd()}
                  disabled={add.isPending}
                  className="h-9 flex-1 rounded-xl bg-white/10 text-white hover:bg-white/16"
                >
                  Thêm bạn
                </Button>
              )}
              <Button
                type="button"
                onClick={() => void onStartChat()}
                disabled={add.isPending || result.blockedByMe}
                className="h-9 flex-1 rounded-xl bg-teal-400 text-teal-950 hover:bg-teal-300"
              >
                Nhắn tin
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
