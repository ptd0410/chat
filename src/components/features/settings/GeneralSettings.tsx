import { SettingsCard, SettingsField, SettingsPane } from "./SettingsPane";

export function GeneralSettings() {
  return (
    <SettingsPane
      title="Chung"
      description="Tùy chọn giao diện và trải nghiệm chat"
    >
      <SettingsCard title="Giao diện">
        <SettingsField label="Chủ đề" value="Tối" />
        <SettingsField label="Ngôn ngữ" value="Tiếng Việt" />
      </SettingsCard>

      <SettingsCard title="Trò chuyện">
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-white">Hành vi chat</p>
          <p className="mt-1 text-sm leading-relaxed text-white/45">
            Các tùy chọn gửi tin, media và thông báo sẽ được thêm tại đây.
          </p>
        </div>
      </SettingsCard>
    </SettingsPane>
  );
}
