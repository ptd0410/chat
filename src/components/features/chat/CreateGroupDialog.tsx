import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui";
import { apiErrorMessage, hueFromId, initialsFromName } from "#/lib";
import { useContacts } from "#/modules/contact";
import { useCreateGroup } from "#/modules/group";
import { Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AvatarBadge } from "./AvatarBadge";

export function CreateGroupDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (groupId: number) => void;
}) {
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const { data: contacts = [], isLoading } = useContacts();
  const create = useCreateGroup();

  function reset() {
    setTitle("");
    setSelected([]);
    create.reset();
  }

  function close() {
    reset();
    onClose();
  }

  function handleOpenChange(next: boolean) {
    if (!next) close();
  }

  function toggle(userId: number) {
    setSelected((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const name = title.trim();
    if (!name) return;
    try {
      const group = await create.mutateAsync({
        title: name,
        memberIds: selected,
      });
      onCreated(group.id);
      close();
    } catch {
      /* shown below */
    }
  }

  const error = create.error
    ? apiErrorMessage(create.error, "Không tạo được nhóm")
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(32rem,calc(100vh-5rem))] flex-col">
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="size-4 text-teal-300" />
              Tạo nhóm
            </DialogTitle>
            <DialogDescription className="sr-only">
              Đặt tên nhóm và chọn thành viên từ danh bạ.
            </DialogDescription>
          </DialogHeader>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tên nhóm"
            className="mt-4 h-10 rounded-xl bg-white/6 px-3 text-sm text-white outline-none ring-1 ring-white/8 placeholder:text-white/30 focus:ring-teal-400/40"
          />

          <p className="mt-4 mb-2 text-[11px] tracking-wide text-white/40 uppercase">
            Thành viên
          </p>
          <div className="chat-scroll min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <p className="py-6 text-center text-sm text-white/40">
                Đang tải danh bạ...
              </p>
            ) : contacts.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/40">
                Chưa có bạn. Thêm bạn trước khi tạo nhóm.
              </p>
            ) : (
              contacts.map((item) => {
                const name = item.user.name || item.user.email || "Người dùng";
                const checked = selected.includes(item.user.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item.user.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/5"
                  >
                    <span
                      className={`grid size-4 place-items-center rounded border ${
                        checked
                          ? "border-teal-300 bg-teal-400"
                          : "border-white/25"
                      }`}
                    />
                    <AvatarBadge
                      initials={initialsFromName(name)}
                      hue={hueFromId(item.user.id)}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-white">
                        {name}
                      </span>
                      <span className="block truncate text-[11px] text-white/40">
                        {item.user.email}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

          <Button
            type="submit"
            disabled={create.isPending || !title.trim()}
            className="mt-4 h-10 rounded-xl bg-teal-400 text-teal-950 hover:bg-teal-300"
          >
            Tạo nhóm
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
