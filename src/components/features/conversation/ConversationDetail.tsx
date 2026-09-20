import type { GroupMemberResponse } from "#/api/group";
import { Button } from "#/components/ui";
import { apiErrorMessage, hueFromId, initialsFromName } from "#/lib";
import { useMe } from "#/modules/auth";
import {
  resolveHeaderSubtitle,
  resolveThreadState,
  useConversation,
  useConversationItem,
  useOpenConversation,
} from "#/modules/conversation";
import {
  canRemoveGroupMember,
  canTransferGroupOwner,
  groupRoleLabel,
  groupRoleRank,
  useGroup,
  useRemoveGroupMember,
} from "#/modules/group";
import { Navigate, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Ban,
  Crown,
  LogOut,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import {
  AddMembersDialog,
  LeaveGroupDialog,
  TransferOwnerDialog,
} from "#/components/features/group";
import { AvatarBadge } from "#/components/features/shared";

export function ConversationDetail({ conversationId }: { conversationId: number }) {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { data: conversation, isLoading } = useConversation(conversationId);
  const actions = useConversationItem(conversation);
  const isGroup = conversation?.type === "GROUP";
  const group = useGroup(isGroup ? conversationId : null);
  const { openDirect } = useOpenConversation();
  const removeMember = useRemoveGroupMember();
  const [addingMembers, setAddingMembers] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState<number | null>(null);
  const members = useMemo(() => {
    const list = group.data?.members ?? [];
    return [...list].sort((a, b) => {
      const roleDelta = groupRoleRank(a.role) - groupRoleRank(b.role);
      if (roleDelta !== 0) return roleDelta;
      const nameA = a.user.name || a.user.email || "";
      const nameB = b.user.name || b.user.email || "";
      return nameA.localeCompare(nameB, "vi");
    });
  }, [group.data?.members]);

  if (Number.isNaN(conversationId)) {
    return <Navigate to="/" />;
  }

  if (!isLoading && !conversation) {
    return <Navigate to="/" />;
  }

  const name = conversation?.name ?? "Hội thoại";
  const myRole = group.data?.myRole ?? conversation?.myRole ?? null;
  const threadState = resolveThreadState({
    type: conversation?.type,
    relation: conversation?.relation ?? null,
    blockStatus: conversation?.blockStatus ?? null,
  });
  const memberCount = group.data?.memberCount ?? conversation?.memberCount ?? 0;
  const isStaff = myRole === "OWNER" || myRole === "ADMIN";
  const isOwner = myRole === "OWNER";
  const canTransfer = canTransferGroupOwner({
    myRole,
    memberCount,
  });
  const busy = actions.pending || removeMember.isPending;
  const error = actions.error
    ? actions.error
    : removeMember.error
      ? apiErrorMessage(removeMember.error, "Không xóa được thành viên")
      : null;

  function goChat() {
    void navigate({
      to: "/conversation/$id",
      params: { id: String(conversationId) },
    });
  }

  const typeLabel =
    conversation?.type === "GROUP"
      ? "Nhóm"
      : conversation?.type === "SAVED"
        ? "Tin nhắn đã lưu"
        : "Trò chuyện trực tiếp";

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--chat-pane)]">
      <header className="flex items-center gap-3 border-b border-white/6 px-3 py-3 md:px-5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 rounded-full text-white/70 hover:bg-white/8"
          onClick={goChat}
          aria-label="Quay lại hội thoại"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">Thông tin</p>
          <p className="truncate text-[11px] text-white/40">{name}</p>
        </div>
      </header>

      <div className="chat-canvas chat-scroll min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-8">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/5 px-4 py-6 text-center ring-1 ring-white/8">
            <AvatarBadge
              initials={conversation?.initials ?? initialsFromName(name)}
              hue={conversation?.hue ?? hueFromId(conversationId)}
              size="xl"
              saved={conversation?.type === "SAVED"}
              src={conversation?.peerAvatar}
            />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-white">{name}</p>
              <p className="text-sm text-white/45">
                {conversation
                  ? resolveHeaderSubtitle({
                      type: conversation.type,
                      memberCount,
                      threadState,
                    })
                  : "Đang tải..."}
              </p>
              {conversation?.type === "DIRECT" && conversation.peerBio?.trim() ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-white/60">
                  {conversation.peerBio.trim()}
                </p>
              ) : null}
            </div>
          </div>

          <DetailCard title="Chi tiết">
            <DetailField label="Loại" value={typeLabel} />
            {conversation?.type === "DIRECT" ? (
              <>
                <DetailField
                  label="Email"
                  value={conversation.peerEmail ?? "—"}
                />
                <DetailField
                  label="Số điện thoại"
                  value={conversation.peerPhone?.trim() || "Chưa có số điện thoại"}
                />
                <div className="px-4 py-3">
                  <p className="text-sm text-white/45">Giới thiệu</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-white">
                    {conversation.peerBio?.trim() || "Chưa có giới thiệu"}
                  </p>
                </div>
              </>
            ) : null}
            {conversation?.type === "GROUP" ? (
              <>
                <DetailField
                  label="Mô tả"
                  value={group.data?.description?.trim() || "Chưa có mô tả"}
                />
                <DetailField label="Thành viên" value={String(memberCount)} />
              </>
            ) : null}
            {conversation?.type === "SAVED" ? (
              <p className="px-4 py-3 text-sm text-white/55">
                Ghi chú riêng cho bạn. Người khác không xem được nội dung này.
              </p>
            ) : null}
          </DetailCard>

          {conversation?.type === "GROUP" ? (
            <DetailCard
              title={`Thành viên · ${memberCount}`}
              action={
                isStaff ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full text-teal-300 hover:bg-white/8 hover:text-teal-200"
                    onClick={() => setAddingMembers(true)}
                    aria-label="Thêm thành viên"
                  >
                    <UserPlus className="size-4" />
                  </Button>
                ) : null
              }
            >
              {group.isLoading ? (
                <p className="px-4 py-6 text-center text-sm text-white/40">
                  Đang tải thành viên...
                </p>
              ) : members.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-white/40">
                  Chưa có thành viên.
                </p>
              ) : (
                members.map((member) => (
                  <MemberRow
                    key={member.userId}
                    member={member}
                    isSelf={Number(member.userId) === Number(me?.id)}
                    canRemove={canRemoveGroupMember({
                      myRole,
                      targetRole: member.role,
                      isSelf: Number(member.userId) === Number(me?.id),
                    })}
                    canTransfer={canTransferGroupOwner({
                      myRole,
                      isSelf: Number(member.userId) === Number(me?.id),
                      memberCount,
                    })}
                    pending={busy}
                    onMessage={() => openDirect(member.userId)}
                    onTransfer={() => {
                      setTransferTargetId(member.userId);
                      setTransferring(true);
                    }}
                    onRemove={() => {
                      removeMember.mutate({
                        id: conversationId,
                        userId: member.userId,
                      });
                    }}
                  />
                ))
              )}
            </DetailCard>
          ) : null}

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          {conversation?.type === "DIRECT" &&
          conversation.blockStatus !== "blocked" &&
          actions.block ? (
            <Button
              type="button"
              variant="ghost"
              className="h-11 justify-center gap-2 rounded-xl bg-red-400/10 text-red-200 hover:bg-red-400/16 hover:text-red-100"
              disabled={busy}
              onClick={actions.block}
            >
              <Ban className="size-4" />
              Chặn
            </Button>
          ) : null}
          {conversation?.type === "DIRECT" &&
          conversation.blockStatus === "blocked" &&
          actions.unblock ? (
            <Button
              type="button"
              variant="ghost"
              className="h-11 justify-center gap-2 rounded-xl bg-white/8 text-white hover:bg-white/12"
              disabled={busy}
              onClick={actions.unblock}
            >
              <Ban className="size-4" />
              Bỏ chặn
            </Button>
          ) : null}
          {conversation?.type === "DIRECT" && actions.hide ? (
            <Button
              type="button"
              variant="ghost"
              className="h-11 justify-center gap-2 rounded-xl bg-red-400/10 text-red-200 hover:bg-red-400/16 hover:text-red-100"
              disabled={busy}
              onClick={actions.hide}
            >
              <Trash2 className="size-4" />
              Xóa đoạn chat
            </Button>
          ) : null}
          {conversation?.type === "GROUP" && canTransfer ? (
            <Button
              type="button"
              variant="ghost"
              className="h-11 justify-center gap-2 rounded-xl bg-white/8 text-white hover:bg-white/12"
              disabled={busy}
              onClick={() => {
                setTransferTargetId(null);
                setTransferring(true);
              }}
            >
              <Crown className="size-4 text-teal-300" />
              Chuyển quyền chủ nhóm
            </Button>
          ) : null}
          {conversation?.type === "GROUP" ? (
            <Button
              type="button"
              variant="ghost"
              className="h-11 justify-center gap-2 rounded-xl bg-red-400/10 text-red-200 hover:bg-red-400/16 hover:text-red-100"
              disabled={busy}
              onClick={() => setLeaving(true)}
            >
              <LogOut className="size-4" />
              Rời nhóm
            </Button>
          ) : null}
        </div>
      </div>

      {isGroup ? (
        <>
          <AddMembersDialog
            open={addingMembers}
            groupId={conversationId}
            existingUserIds={members.map((item) => item.userId)}
            onClose={() => setAddingMembers(false)}
          />
          <LeaveGroupDialog
            open={leaving}
            groupId={conversationId}
            groupName={name}
            myRole={myRole}
            memberCount={memberCount}
            onClose={() => setLeaving(false)}
          />
          {isOwner ? (
            <TransferOwnerDialog
              open={transferring}
              groupId={conversationId}
              initialUserId={transferTargetId}
              onClose={() => {
                setTransferring(false);
                setTransferTargetId(null);
              }}
            />
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function DetailCard({
  title,
  action,
  children,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/8">
      {title ? (
        <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-1">
          <p className="text-[11px] tracking-wide text-white/40 uppercase">
            {title}
          </p>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <p className="text-sm text-white/45">{label}</p>
      <p className="min-w-0 text-right text-sm font-medium wrap-break-word text-white">
        {value}
      </p>
    </div>
  );
}

function MemberRow({
  member,
  isSelf,
  canRemove,
  canTransfer,
  pending,
  onMessage,
  onTransfer,
  onRemove,
}: {
  member: GroupMemberResponse;
  isSelf: boolean;
  canRemove: boolean;
  canTransfer: boolean;
  pending: boolean;
  onMessage: () => void;
  onTransfer: () => void;
  onRemove: () => void;
}) {
  const name = member.user.name || member.user.email || "Người dùng";
  const content = (
    <>
      <AvatarBadge
        initials={initialsFromName(name)}
        hue={hueFromId(member.userId)}
        size="sm"
        src={member.user.avatar}
      />
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-sm font-medium text-white">{name}</span>
          {isSelf ? (
            <span className="shrink-0 rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] text-white/60">
              Bạn
            </span>
          ) : null}
        </span>
        <span className="block truncate text-[11px] text-white/40">
          {groupRoleLabel(member.role)}
          {member.user.bio
            ? ` · ${member.user.bio}`
            : member.user.email
              ? ` · ${member.user.email}`
              : ""}
        </span>
      </span>
    </>
  );

  return (
    <div className="flex items-center gap-1 px-2 py-1.5">
      {isSelf ? (
        <div className="flex min-w-0 flex-1 items-center gap-3 px-2 py-1">
          {content}
        </div>
      ) : (
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1 text-left hover:bg-white/5"
          onClick={onMessage}
        >
          {content}
        </button>
      )}
      {canTransfer ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-full text-teal-300 hover:bg-white/8 hover:text-teal-200"
          disabled={pending}
          onClick={onTransfer}
          aria-label={`Chuyển quyền chủ nhóm cho ${name}`}
        >
          <Crown className="size-4" />
        </Button>
      ) : null}
      {canRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-full text-red-300 hover:bg-red-400/10 hover:text-red-200"
          disabled={pending}
          onClick={onRemove}
          aria-label={`Xóa ${name} khỏi nhóm`}
        >
          <UserMinus className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
