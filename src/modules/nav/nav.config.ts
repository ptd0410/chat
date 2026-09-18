export const NAV_TABS = [
  "conversations",
  "contacts",
  "calls",
  "settings",
] as const;

export type NavTab = (typeof NAV_TABS)[number];

export const SETTINGS_PATHS = {
  root: "/settings",
  account: "/settings/account",
  general: "/settings/general",
  privacy: "/settings/privacy",
  blocked: "/settings/privacy/blocked",
} as const;

export function tabFromPathname(pathname: string): NavTab {
  if (pathname === "/contacts" || pathname.startsWith("/contacts/")) {
    return "contacts";
  }
  if (pathname === "/calls" || pathname.startsWith("/calls/")) {
    return "calls";
  }
  if (pathname === "/settings" || pathname.startsWith("/settings/")) {
    return "settings";
  }
  return "conversations";
}

export function isSettingsDetail(pathname: string) {
  return pathname.startsWith("/settings/");
}

export function isConversationPane(pathname: string) {
  return (
    pathname.startsWith("/conversation/") || pathname.startsWith("/direct/")
  );
}
