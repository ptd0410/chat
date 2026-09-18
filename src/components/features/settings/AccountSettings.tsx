import { useLogout, useMe, useUpdateMe } from "#/modules/auth";
import { Button } from "#/components/ui";
import { apiErrorMessage, hueFromId, initialsFromName } from "#/lib";
import { AvatarBadge } from "#/components/features/shared";
import { LogOut } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import {
  SettingsCard,
  SettingsField,
  SettingsFormField,
  SettingsPane,
} from "./SettingsPane";

const inputClass =
  "h-10 rounded-xl bg-white/6 px-3 text-sm text-white outline-none ring-1 ring-white/8 placeholder:text-white/30 focus:ring-teal-400/40";

export function AccountSettings() {
  const { data } = useMe();
  const logout = useLogout();
  const update = useUpdateMe();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!data) return;
    setName(data.profile?.name ?? "");
    setBio(data.profile?.bio ?? "");
    setPhone(data.phone ?? "");
  }, [data?.id]);

  const displayName = data?.profile?.name ?? data?.uid ?? "Bạn";
  const createdAt = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString("vi-VN")
    : "—";
  const dirty =
    name.trim() !== (data?.profile?.name ?? "") ||
    bio.trim() !== (data?.profile?.bio ?? "") ||
    phone.trim() !== (data?.phone ?? "");
  const canSave = dirty && Boolean(name.trim()) && !update.isPending;
  const error = update.error
    ? apiErrorMessage(update.error, "Không lưu được thông tin")
    : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const nextName = name.trim();
    if (!nextName) return;
    try {
      await update.mutateAsync({
        name: nextName,
        bio: bio.trim(),
        phone: phone.trim(),
      });
    } catch {
      /* shown below */
    }
  }

  return (
    <SettingsPane title="Tài khoản" description="Thông tin hồ sơ của bạn">
      <div className="flex items-center gap-4 rounded-2xl bg-white/5 px-4 py-4 ring-1 ring-white/8">
        <AvatarBadge
          initials={initialsFromName(displayName)}
          hue={hueFromId(data?.id ?? 0)}
          size="lg"
          src={data?.profile?.avatar}
        />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-white">
            {displayName}
          </p>
          <p className="truncate text-sm text-white/45">
            {data?.email ?? "Chưa có email"}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <SettingsCard title="Hồ sơ">
          <SettingsFormField label="Tên hiển thị" htmlFor="account-name">
            <input
              id="account-name"
              value={name}
              maxLength={64}
              autoComplete="name"
              placeholder="Tên của bạn"
              className={inputClass}
              onChange={(e) => {
                setName(e.target.value);
                update.reset();
              }}
            />
          </SettingsFormField>
          <SettingsFormField label="Giới thiệu" htmlFor="account-bio">
            <textarea
              id="account-bio"
              value={bio}
              maxLength={280}
              rows={3}
              placeholder="Vài dòng về bạn"
              className={`${inputClass} h-auto min-h-20 resize-y py-2`}
              onChange={(e) => {
                setBio(e.target.value);
                update.reset();
              }}
            />
          </SettingsFormField>
          <SettingsFormField label="Số điện thoại" htmlFor="account-phone">
            <input
              id="account-phone"
              value={phone}
              maxLength={32}
              autoComplete="tel"
              inputMode="tel"
              placeholder="Chưa có số điện thoại"
              className={inputClass}
              onChange={(e) => {
                setPhone(e.target.value);
                update.reset();
              }}
            />
          </SettingsFormField>
        </SettingsCard>

        <SettingsCard title="Tài khoản">
          <SettingsField label="Email" value={data?.email ?? "—"} />
          <SettingsField label="UID" value={data?.uid ?? "—"} />
          <SettingsField label="Tham gia" value={createdAt} />
        </SettingsCard>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {update.isSuccess && !dirty ? (
          <p className="text-sm text-teal-300">Đã lưu thay đổi</p>
        ) : null}

        <Button
          type="submit"
          disabled={!canSave}
          className="h-11 justify-center rounded-xl bg-teal-400 text-teal-950 hover:bg-teal-300"
        >
          {update.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </form>

      <Button
        type="button"
        variant="ghost"
        className="h-11 justify-center gap-2 rounded-xl bg-red-400/10 text-red-200 hover:bg-red-400/16 hover:text-red-100"
        onClick={() => logout.mutate()}
      >
        <LogOut className="size-4" />
        Đăng xuất
      </Button>
    </SettingsPane>
  );
}
