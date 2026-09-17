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
import { useAddGroupMembers } from "#/modules/group";
import { UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AvatarBadge } from "./AvatarBadge";

export function AddMembersDialog({
  open,
  groupId,
  existingUserIds,
  onClose,
}: {
  open: boolean;
  groupId: number;
  existingUserIds: number[];
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const { data: contacts = [], isLoading } = useContacts();
  const addMembers = useAddGroupMembers();
  const existing = new Set(existingUserIds);
  const candidates = contacts.filter((item) => !existing.has(item.user.id));

  function reset() {
    setSelected([]);
    addMembers.reset();
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
    if (selected.length === 0) return;
    try {
      await addMembers.mutateAsync({ id: groupId, userIds: selected });
      close();
    } catch {
      /* shown below */
    }
  }

  const error = addMembers.error
    ? apiErrorMessage(addMembers.error, "Không thêm được thành viên")
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(32rem,calc(100vh-5rem))] flex-col">
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="size-4 text-teal-300" />
              Thêm thành viên
            </DialogTitle>
            <DialogDescription className="sr-only">
              Chọn bạn bè để thêm vào nhóm.
            </DialogDescription>
          </DialogHeader>

          <div className="chat-scroll mt-4 min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <p className="py-6 text-center text-sm text-white/40">
                Đang tải danh bạ...
              </p>
            ) : candidates.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/40">
                Không còn bạn nào để thêm.
              </p>
            ) : (
              candidates.map((item) => {
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
            disabled={addMembers.isPending || selected.length === 0}
            className="mt-4 h-10 rounded-xl bg-teal-400 text-teal-950 hover:bg-teal-300"
          >
            Thêm
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
