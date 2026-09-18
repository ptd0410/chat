import { EmptyPane } from "#/components/features/shared";
import { createFileRoute } from "@tanstack/react-router";
import { Phone } from "lucide-react";

export const Route = createFileRoute("/_chat/calls")({
  component: CallsRoute,
});

function CallsRoute() {
  return (
    <EmptyPane
      icon={Phone}
      title="Cuộc gọi"
      description="Lịch sử cuộc gọi sẽ xuất hiện ở đây khi tính năng gọi được bật."
    />
  );
}
