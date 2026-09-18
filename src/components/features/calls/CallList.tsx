import { Phone } from "lucide-react";
import { SidebarHeader } from "#/components/features/shared";

export function CallList() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SidebarHeader title="Cuộc gọi" />
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-white/6 ring-1 ring-white/10">
          <Phone className="size-6 text-teal-300" />
        </div>
        <p className="text-sm font-medium text-white/80">Chưa có cuộc gọi</p>
        <p className="mt-1 max-w-[240px] text-sm text-white/40">
          Lịch sử gọi sẽ xuất hiện tại đây khi tính năng cuộc gọi được bật.
        </p>
      </div>
    </div>
  );
}
