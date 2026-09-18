import type {
  BlockStatus,
  ConversationType,
  DirectRelation,
  InboxConversationResponse,
} from "#/api/conversation";
import type { MemberRole } from "#/api/group";
import { hueFromId, initialsFromName } from "#/lib";

export type ConversationListItem = {
  id: number;
  type: ConversationType;
  peerId: number | null;
  peerEmail: string | null;
  peerPhone: string | null;
  peerBio: string | null;
  peerAvatar: string | null;
  name: string;
  preview: string;
  lastMessageAt: string | null;
  memberCount: number;
  initials: string;
  hue: number;
  relation: DirectRelation | null;
  blockStatus: BlockStatus | null;
  myRole: MemberRole | null;
};

function previewFor(item: InboxConversationResponse) {
  const text = item.lastMessage?.content?.trim();
  if (text) return text;
  if (item.type === "SAVED") return "Ghi chú cho riêng bạn";
  if (item.blockStatus === "blocked") return "Bạn đã chặn người này";
  if (item.blockStatus === "blocked_by_peer") return "Không thể nhắn tin";
  if (item.relation === "incoming_pending") return "Tin nhắn chờ";
  if (item.relation === "outgoing_pending") return "Đã gửi lời mời kết bạn";
  return "Chưa có tin nhắn";
}

export function toConversationListItem(
  item: InboxConversationResponse,
): ConversationListItem {
  const name =
    item.type === "SAVED"
      ? "Tin nhắn đã lưu"
      : item.type === "GROUP"
        ? item.title || "Nhóm"
        : item.peer?.name || item.peer?.email || "Người dùng";

  return {
    id: item.id,
    type: item.type,
    peerId: item.type === "DIRECT" ? (item.peer?.id ?? null) : null,
    peerEmail: item.type === "DIRECT" ? (item.peer?.email ?? null) : null,
    peerPhone: item.type === "DIRECT" ? (item.peer?.phone ?? null) : null,
    peerBio: item.type === "DIRECT" ? (item.peer?.bio ?? null) : null,
    peerAvatar:
      item.type === "DIRECT" ? (item.peer?.avatar ?? null) : null,
    name,
    preview: previewFor(item),
    lastMessageAt: item.lastMessageAt ?? item.lastMessage?.createdAt ?? null,
    memberCount: item.memberCount,
    initials: initialsFromName(name),
    hue: hueFromId(item.peer?.id ?? item.id),
    relation: item.relation,
    blockStatus: item.blockStatus,
    myRole: item.myRole,
  };
}
