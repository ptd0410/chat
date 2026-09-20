import axios from "axios";

export function apiErrorMessage(error: unknown, fallback = "Có lỗi xảy ra") {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
      return typeof message[0] === "string" ? message[0] : fallback;
    }
    if (typeof message === "string" && message.trim()) return message;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}
