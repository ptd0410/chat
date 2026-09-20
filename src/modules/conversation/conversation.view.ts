import type { ConversationType } from "#/api/conversation";
import type {
  MessageAttachment,
  MessageForwardPreview,
  MessageReactionItem,
  MessageReplyPreview,
  MessageResponse,
} from "#/api/message";

export type ChatHeader = {
  name: string;
  initials: string;
  hue: number;
  subtitle?: string;
  avatar?: string | null;
};

export type ChatReplyPreview = {
  id: number;
  senderName: string;
  content: string;
  deleted: boolean;
};

export type ChatForwardPreview = {
  senderName: string;
};

export type ChatReactionView = {
  emoji: string;
  count: number;
  reacted: boolean;
};

export type ChatMessageView = {
  id: number;
  content: string;
  createdAt: string;
  edited: boolean;
  mine: boolean;
  senderName: string;
  replyTo: ChatReplyPreview | null;
  forwardFrom: ChatForwardPreview | null;
  attachments: MessageAttachment[];
  reactions: ChatReactionView[];
};

function displaySenderName(
  senderId?: number | string | null,
  senderName?: string | null,
  myId?: number | null,
) {
  if (senderId != null && myId != null && Number(senderId) === Number(myId)) {
    return "Bạn";
  }
  const name = senderName?.trim();
  return name || "Người dùng";
}

export function replyPreviewText(input: {
  content?: string | null;
  attachmentName?: string | null;
  deleted?: boolean;
}) {
  if (input.deleted) return "";
  const text = input.content?.trim();
  if (text) return text;
  if (input.attachmentName?.trim()) return input.attachmentName.trim();
  return "Tệp đính kèm";
}

function toReplyPreview(
  replyTo: MessageReplyPreview | null | undefined,
  myId?: number | null,
): ChatReplyPreview | null {
  if (!replyTo) return null;
  return {
    id: Number(replyTo.id),
    senderName: displaySenderName(replyTo.senderId, replyTo.senderName, myId),
    content: replyPreviewText(replyTo),
    deleted: replyTo.deleted,
  };
}

function toForwardPreview(
  forwardFrom: MessageForwardPreview | null | undefined,
  myId?: number | null,
): ChatForwardPreview | null {
  if (!forwardFrom) return null;
  return {
    senderName: displaySenderName(
      forwardFrom.senderId,
      forwardFrom.senderName,
      myId,
    ),
  };
}

function toReactionViews(
  reactions: MessageReactionItem[] | undefined,
  myId?: number | null,
): ChatReactionView[] {
  const groups: ChatReactionView[] = [];
  const indexByEmoji = new Map<string, number>();
  for (const item of reactions ?? []) {
    let index = indexByEmoji.get(item.emoji);
    if (index == null) {
      index = groups.length;
      indexByEmoji.set(item.emoji, index);
      groups.push({ emoji: item.emoji, count: 0, reacted: false });
    }
    const group = groups[index]!;
    group.count += 1;
    if (myId != null && Number(item.userId) === Number(myId)) {
      group.reacted = true;
    }
  }
  return groups;
}

export function toChatMessageView(
  item: MessageResponse,
  myId?: number | null,
): ChatMessageView {
  return {
    id: Number(item.id),
    content: item.content ?? "",
    mine: Number(item.senderId) === Number(myId),
    senderName: displaySenderName(item.senderId, item.senderName, myId),
    createdAt: item.createdAt,
    edited: Boolean(item.editedAt),
    replyTo: toReplyPreview(item.replyTo, myId),
    forwardFrom: toForwardPreview(item.forwardFrom, myId),
    attachments: item.attachments ?? [],
    reactions: toReactionViews(item.reactions, myId),
  };
}

export type ChatThreadState =
  | "open"
  | "incoming_pending"
  | "outgoing_pending"
  | "blocked"
  | "blocked_by_peer";

export function resolveThreadState(input: {
  type?: ConversationType | null;
  relation?: string | null;
  blockStatus?: string | null;
}): ChatThreadState {
  if (input.type === "GROUP" || input.type === "SAVED") return "open";
  if (input.blockStatus === "blocked") return "blocked";
  if (input.blockStatus === "blocked_by_peer") return "blocked_by_peer";
  if (input.relation === "incoming_pending") return "incoming_pending";
  if (input.relation === "outgoing_pending") return "outgoing_pending";
  return "open";
}

export function resolveHeaderSubtitle(input: {
  type?: ConversationType | null;
  memberCount?: number;
  threadState?: ChatThreadState;
}) {
  if (input.type === "SAVED") return "Chỉ mình bạn thấy";
  if (input.type === "GROUP") return `${input.memberCount ?? 0} thành viên`;
  if (input.threadState === "incoming_pending") return "Tin nhắn chờ";
  if (input.threadState === "outgoing_pending") return "Đang chờ phản hồi";
  if (input.threadState === "blocked") return "Đã chặn";
  return "Direct";
}
