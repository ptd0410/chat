import { ChatPane, type ChatThreadState } from "#/components/features/chat/ChatPane";
import { queryClient } from "#/clients";
import { apiErrorMessage, hueFromId, initialsFromName } from "#/lib";
import {
  useBlockUser,
  useBlockedUsers,
  useContacts,
  useUnblockUser,
} from "#/modules/contact";
import {
  conversationQueryKey,
  useConversations,
} from "#/modules/conversation";
import { useSendMessage } from "#/modules/message";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_chat/direct/$userId")({
  component: DirectRoute,
});

function DirectRoute() {
  const { userId: rawId } = Route.useParams();
  const userId = Number(rawId);
  const navigate = useNavigate();
  const { data: contacts = [] } = useContacts();
  const { data: blocked = [] } = useBlockedUsers();
  const { data: conversations = [] } = useConversations();
  const send = useSendMessage();
  const block = useBlockUser();
  const unblock = useUnblockUser();

  if (Number.isNaN(userId)) {
    return <Navigate to="/" />;
  }

  const existing = conversations.find(
    (item) => item.type === "DIRECT" && item.peerId === userId,
  );
  if (existing) {
    return (
      <Navigate to="/conversation/$id" params={{ id: String(existing.id) }} />
    );
  }

  const contact = contacts.find((item) => item.user.id === userId);
  const blockedRow = blocked.find((item) => item.user.id === userId);
  const name = contact?.user.name || contact?.user.email || "Người dùng";
  const threadState: ChatThreadState = blockedRow ? "blocked" : "open";
  const busy = send.isPending || block.isPending || unblock.isPending;
  const error = send.error
    ? apiErrorMessage(send.error, "Không gửi được tin nhắn")
    : block.error
      ? apiErrorMessage(block.error, "Không chặn được")
      : unblock.error
        ? apiErrorMessage(unblock.error, "Không bỏ chặn được")
        : null;

  return (
    <ChatPane
      header={{
        name,
        initials: initialsFromName(name),
        hue: hueFromId(userId),
        subtitle: blockedRow ? "Đã chặn" : "Direct",
      }}
      messages={[]}
      sending={busy}
      threadState={threadState}
      conversationType="DIRECT"
      error={error}
      onBack={() => void navigate({ to: "/" })}
      onBlock={() => {
        block.mutate({ userId });
      }}
      onUnblock={() => {
        unblock.mutate(userId);
      }}
      onSend={(content) => {
        send.mutate(
          { userId, content },
          {
            onSuccess: (result) => {
              void queryClient.invalidateQueries({
                queryKey: conversationQueryKey.list,
              });
              void navigate({
                to: "/conversation/$id",
                params: { id: String(result.conversation.id) },
              });
            },
          },
        );
      }}
    />
  );
}
