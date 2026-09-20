import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui";
import { apiErrorMessage } from "#/lib";
import { useMe } from "#/modules/auth";
import { useGroup, useTransferOwner } from "#/modules/group";
import { Crown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GroupMemberSelectList } from "./GroupMemberSelectList";

export function TransferOwnerDialog({
  open,
  groupId,
  initialUserId = null,
  onClose,
}: {
  open: boolean;
  groupId: number;
  initialUserId?: number | null;
  onClose: () => void;
}) {
  const { data: me } = useMe();
  const group = useGroup(open ? groupId : null);
  const transfer = useTransferOwner();
  const [selectedId, setSelectedId] = useState<number | null>(initialUserId);

  const candidates = useMemo(() => {
    return (group.data?.members ?? []).filter(
      (item) => Number(item.userId) !== Number(me?.id),
    );
  }, [group.data?.members, me?.id]);

  useEffect(() => {
    if (!open) return;
    setSelectedId(initialUserId);
    transfer.reset();
  }, [open, initialUserId, transfer.reset]);

  const pending = transfer.isPending;
  const error = transfer.error
    ? apiErrorMessage(transfer.error, "Không chuyển được quyền chủ nhóm")
    : null;
  const selected = candidates.find((item) => item.userId === selectedId);
  const selectedName =
    selected?.user.name || selected?.user.email || "thành viên này";

  function close() {
    if (pending) return;
    setSelectedId(null);
    transfer.reset();
    onClose();
  }

  function handleOpenChange(next: boolean) {
    if (!next) close();
  }

  async function onSubmit() {
    if (selectedId == null) return;
    try {
      await transfer.mutateAsync({ id: groupId, userId: selectedId });
      onClose();
    } catch {
      /* shown below */
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(32rem,calc(100vh-5rem))] flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="size-4 text-teal-300" />
            Chuyển quyền chủ nhóm
          </DialogTitle>
          <DialogDescription>
            {selectedId != null
              ? `${selectedName} sẽ trở thành chủ nhóm. Bạn sẽ thành quản trị viên.`
              : "Chọn thành viên sẽ trở thành chủ nhóm mới. Bạn sẽ thành quản trị viên."}
          </DialogDescription>
        </DialogHeader>

        {group.isLoading ? (
          <p className="py-6 text-center text-sm text-white/40">
            Đang tải thành viên...
          </p>
        ) : (
          <GroupMemberSelectList
            members={candidates}
            selectedId={selectedId}
            onSelect={setSelectedId}
            disabled={pending}
          />
        )}

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            className="h-10 rounded-xl text-white/70 hover:bg-white/8 hover:text-white"
            disabled={pending}
            onClick={close}
          >
            Hủy
          </Button>
          <Button
            type="button"
            disabled={pending || selectedId == null}
            className="h-10 rounded-xl bg-teal-400 text-teal-950 hover:bg-teal-300"
            onClick={() => void onSubmit()}
          >
            Chuyển quyền
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
