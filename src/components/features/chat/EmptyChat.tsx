import { MessageCircle } from "lucide-react";

export function EmptyChat() {
  return (
    <div className="chat-canvas relative flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="mb-5 grid size-16 place-items-center rounded-2xl bg-white/6 ring-1 ring-white/10">
        <MessageCircle className="size-7 text-teal-300" />
      </div>
      <h2 className="font-heading text-2xl font-semibold tracking-tight text-white">
        Chưa chọn hội thoại
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/45">
        Chọn một cuộc trò chuyện bên trái, thêm bạn, hoặc tạo nhóm để bắt đầu
        nhắn tin.
      </p>
    </div>
  );
}
