import { MessageCircle } from "lucide-react";
import { EmptyPane } from "#/components/features/shared";

export function EmptyChat() {
  return (
    <EmptyPane
      icon={MessageCircle}
      title="Chưa chọn hội thoại"
      description="Chọn một cuộc trò chuyện bên trái, thêm bạn, hoặc tạo nhóm để bắt đầu nhắn tin."
    />
  );
}
