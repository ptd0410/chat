import type { MemberRole } from "#/api/group";

export function groupRoleLabel(role: MemberRole | null | undefined) {
  if (role === "OWNER") return "Chủ nhóm";
  if (role === "ADMIN") return "Quản trị viên";
  if (role === "BOT") return "Bot";
  if (role === "SUBSCRIBER") return "Người theo dõi";
  return "Thành viên";
}

export function groupRoleRank(role: MemberRole | null | undefined) {
  if (role === "OWNER") return 0;
  if (role === "ADMIN") return 1;
  if (role === "BOT") return 2;
  if (role === "SUBSCRIBER") return 4;
  return 3;
}

export function canRemoveGroupMember(input: {
  myRole?: MemberRole | null;
  targetRole?: MemberRole | null;
  isSelf?: boolean;
}) {
  if (input.isSelf) return false;
  if (input.targetRole === "OWNER") return false;
  if (input.myRole === "OWNER") return true;
  return input.myRole === "ADMIN" && input.targetRole !== "ADMIN";
}
