import { EmptyPane } from "#/components/features/shared";
import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/_chat/settings/")({
  component: SettingsIndexRoute,
});

function SettingsIndexRoute() {
  return (
    <EmptyPane
      icon={Settings}
      title="Cài đặt"
      description="Chọn Chung hoặc Quyền riêng tư để chỉnh ứng dụng và tài khoản."
    />
  );
}
