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
import { useChatThread } from "#/modules/conversation";
import { useGroup, useLeaveGroup, useTransferOwner } from "#/modules/group";
import type { MemberRole } from "#/api/group";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Crown, LogOut } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GroupMemberSelectList } from "./GroupMemberSelectList";

type LeaveStep = "confirm" | "pick";

export function LeaveGroupDialog({
  open,
  groupId,
  groupName,
  myRole,
  memberCount,
  onClose,
}: {
  open: boolean;
  groupId: number;
  groupName: string;
  myRole?: MemberRole | null;
  memberCount?: number;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { conversationId } = useChatThread();
  const { data: me } = useMe();
  const group = useGroup(open ? groupId : null);
  const leaveGroup = useLeaveGroup();
  const transfer = useTransferOwner();
  const [step, setStep] = useState<LeaveStep>("confirm");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const isOwner = (group.data?.myRole ?? myRole) === "OWNER";
  const candidates = useMemo(() => {
    return (group.data?.members ?? []).filter(
      (item) => Number(item.userId) !== Number(me?.id),
    );
  }, [group.data?.members, me?.id]);
  const ownerLoading = isOwner && group.isLoading;
  const hasSuccessor = ownerLoading
    ? (memberCount ?? 0) > 1
    : candidates.length > 0;

  useEffect(() => {
    if (!open) return;
    setStep("confirm");
    setSelectedId(null);
    leaveGroup.reset();
    transfer.reset();
  }, [open, leaveGroup.reset, transfer.reset]);

  const pending = leaveGroup.isPending || transfer.isPending;
  const error = leaveGroup.error
    ? apiErrorMessage(leaveGroup.error, "Không rời được nhóm")
    : transfer.error
      ? apiErrorMessage(transfer.error, "Không chuyển được quyền chủ nhóm")
      : null;

  function close() {
    if (pending) return;
    setStep("confirm");
    setSelectedId(null);
    leaveGroup.reset();
    transfer.reset();
    onClose();
  }

  function handleOpenChange(next: boolean) {
    if (!next) close();
  }

  async function finishLeave() {
    await leaveGroup.mutateAsync(groupId);
    onClose();
    if (conversationId === groupId) {
      void navigate({ to: "/" });
    }
  }

  async function leaveNow() {
    try {
      await finishLeave();
    } catch {
      /* shown below */
    }
  }

  async function transferAndLeave() {
    if (selectedId == null) return;
    try {
      await transfer.mutateAsync({ id: groupId, userId: selectedId });
      await finishLeave();
    } catch {
      /* shown below */
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(32rem,calc(100vh-5rem))] flex-col">
        {step === "pick" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="size-4 text-teal-300" />
                Chọn chủ nhóm mới
              </DialogTitle>
              <DialogDescription>
                Sau khi chuyển quyền, bạn sẽ rời nhóm {groupName}.
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
                onClick={() => setStep("confirm")}
              >
                <ArrowLeft className="size-4" />
                Quay lại
              </Button>
              <Button
                type="button"
                disabled={pending || selectedId == null}
                className="h-10 rounded-xl bg-red-400/80 text-white hover:bg-red-400"
                onClick={() => void transferAndLeave()}
              >
                Chuyển quyền và rời nhóm
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LogOut className="size-4 text-red-300" />
                Rời nhóm
              </DialogTitle>
              <DialogDescription>
                {isOwner && hasSuccessor
                  ? `Bạn đang là chủ nhóm ${groupName}. Hãy chọn cách rời nhóm.`
                  : isOwner
                    ? `Bạn là thành viên duy nhất của nhóm ${groupName}. Rời nhóm sẽ để nhóm không còn thành viên.`
                    : `Bạn sẽ không còn nhận tin nhắn từ nhóm ${groupName}.`}
              </DialogDescription>
            </DialogHeader>

            {ownerLoading ? (
              <p className="py-4 text-center text-sm text-white/40">
                Đang tải thông tin nhóm...
              </p>
            ) : isOwner && hasSuccessor ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setStep("pick")}
                  className="flex items-start gap-3 rounded-xl bg-white/5 px-3 py-3 text-left ring-1 ring-white/8 hover:bg-white/8 disabled:opacity-50"
                >
                  <Crown className="mt-0.5 size-4 shrink-0 text-teal-300" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-white">
                      Chọn người rồi rời nhóm
                    </span>
                    <span className="mt-0.5 block text-[12px] text-white/45">
                      Bạn chọn thành viên nhận quyền chủ nhóm, sau đó rời nhóm.
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void leaveNow()}
                  className="flex items-start gap-3 rounded-xl bg-red-400/10 px-3 py-3 text-left ring-1 ring-red-400/15 hover:bg-red-400/16 disabled:opacity-50"
                >
                  <LogOut className="mt-0.5 size-4 shrink-0 text-red-300" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-red-100">
                      Rời nhóm ngay
                    </span>
                    <span className="mt-0.5 block text-[12px] text-red-100/55">
                      Quyền chủ nhóm sẽ được chuyển tự động cho thành viên còn
                      lại.
                    </span>
                  </span>
                </button>
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-300">{error}</p> : null}

            {isOwner && (ownerLoading || hasSuccessor) ? (
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
              </DialogFooter>
            ) : (
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
                  disabled={pending}
                  className="h-10 rounded-xl bg-red-400/80 text-white hover:bg-red-400"
                  onClick={() => void leaveNow()}
                >
                  Rời nhóm
                </Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
