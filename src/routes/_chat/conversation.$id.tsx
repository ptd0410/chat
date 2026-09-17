import { AddMembersDialog } from "#/components/features/chat/AddMembersDialog";
import { ChatPane, type ChatThreadState } from "#/components/features/chat/ChatPane";
import { queryClient } from "#/clients";
import { apiErrorMessage, hueFromId, initialsFromName } from "#/lib";
import { useMe } from "#/modules/auth";
import { contactQueryKey } from "#/modules/contact";
import {
  refreshInbox,
  useConversationItem,
  useConversations,
} from "#/modules/conversation";
import { useGroup } from "#/modules/group";
import { useMessages, useSendMessage, useDeleteMessage } from "#/modules/message";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_chat/conversation/$id")({
  component: ConversationRoute,
});

function threadState(input: {
  relation: string | null;
  blockStatus: string | null;
}): ChatThreadState {
  if (input.blockStatus === "blocked") return "blocked";
  if (input.blockStatus === "blocked_by_peer") return "blocked_by_peer";
  if (input.relation === "incoming_pending") return "incoming_pending";
  if (input.relation === "outgoing_pending") return "outgoing_pending";
  return "open";
}

function ConversationRoute() {
  const { id } = Route.useParams();
  const conversationId = Number(id);
  const { data: me } = useMe();
  const { data: conversations = [], isLoading: loadingList } =
    useConversations();
  const messages = useMessages(
    Number.isNaN(conversationId) ? null : conversationId,
  );
  const send = useSendMessage();
  const remove = useDeleteMessage();
  const navigate = useNavigate();
  const conversation = conversations.find((item) => item.id === conversationId);
  const actions = useConversationItem(conversation);
  const isGroup = conversation?.type === "GROUP";
  const group = useGroup(isGroup ? conversationId : null);
  const [addingMembers, setAddingMembers] = useState(false);

  if (Number.isNaN(conversationId)) {
    return <Navigate to="/" />;
  }

  if (messages.isError && !loadingList && !conversation) {
    return <Navigate to="/" />;
  }

  const name = conversation?.name ?? "Hội thoại";
  const myRole = group.data?.myRole ?? conversation?.myRole ?? null;
  const state = threadState({
    relation: conversation?.relation ?? null,
    blockStatus: conversation?.blockStatus ?? null,
  });
  const busy = send.isPending || remove.isPending || actions.pending;
  const error = send.error
    ? apiErrorMessage(send.error, "Không gửi được tin nhắn")
    : remove.error
      ? apiErrorMessage(remove.error, "Không xóa được tin nhắn")
      : actions.error;

  function refreshThread() {
    refreshInbox();
    void queryClient.invalidateQueries({ queryKey: contactQueryKey.list });
  }

  function goHome() {
    void navigate({ to: "/" });
  }

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <ChatPane
        header={{
          name,
          initials: conversation?.initials ?? initialsFromName(name),
          hue: conversation?.hue ?? hueFromId(conversationId),
          subtitle:
            conversation?.type === "GROUP"
              ? `${conversation.memberCount} thành viên`
              : state === "incoming_pending"
                ? "Tin nhắn chờ"
                : state === "outgoing_pending"
                  ? "Đang chờ phản hồi"
                  : state === "blocked"
                    ? "Đã chặn"
                    : "Direct",
        }}
        messages={(messages.data ?? [])
          .filter(
            (item, index, list) =>
              list.findIndex((other) => Number(other.id) === Number(item.id)) ===
              index,
          )
          .map((item) => ({
            id: Number(item.id),
            content: item.content ?? "",
            createdAt: item.createdAt,
            mine: Number(item.senderId) === Number(me?.id),
          }))}
        sending={busy}
        threadState={conversation?.type === "GROUP" ? "open" : state}
        conversationType={conversation?.type ?? "DIRECT"}
        myRole={myRole}
        error={error}
        onBack={goHome}
        onBlock={actions.block}
        onUnblock={actions.unblock}
        onHide={actions.hide}
        onLeave={actions.leave}
        onAddMembers={
          conversation?.type === "GROUP" &&
          (myRole === "OWNER" || myRole === "ADMIN")
            ? () => setAddingMembers(true)
            : undefined
        }
        onSend={(content) => {
          send.mutate(
            { conversationId, content },
            { onSuccess: refreshThread },
          );
        }}
        onDeleteMessage={(messageId) => {
          remove.mutate(messageId, { onSuccess: refreshThread });
        }}
      />
      {conversation?.type === "GROUP" ? (
        <AddMembersDialog
          open={addingMembers}
          groupId={conversationId}
          existingUserIds={(group.data?.members ?? []).map((item) => item.userId)}
          onClose={() => setAddingMembers(false)}
        />
      ) : null}
    </div>
  );
}
