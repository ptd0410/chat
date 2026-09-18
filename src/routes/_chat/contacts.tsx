import { EmptyPane } from "#/components/features/shared";
import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_chat/contacts")({
  component: ContactsRoute,
});

function ContactsRoute() {
  return (
    <EmptyPane
      icon={Users}
      title="Danh bạ"
      description="Chọn một liên hệ bên trái để bắt đầu trò chuyện."
    />
  );
}
