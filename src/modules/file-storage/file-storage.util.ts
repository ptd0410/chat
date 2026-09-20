import { fileApi } from "@file-storage/client";
import type { MessageAttachmentInput } from "#/api/message";

export const CHAT_FILE_MAX_SIZE = 25 * 1024 * 1024;
export const CHAT_FILE_MAX_COUNT = 8;

export function formatFileSize(bytes: number | null | undefined) {
  if (bytes == null || Number.isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function chatFilePath(userId: number, file: File) {
  const safeName =
    file.name.replace(/[^\w.\-()\s]+/g, "_").slice(0, 120).trim() || "file";
  return `user/${userId}/${crypto.randomUUID()}/${safeName}`;
}

export async function uploadChatFiles(userId: number, files: File[]) {
  if (files.length > CHAT_FILE_MAX_COUNT) {
    throw new Error(`Chỉ gửi tối đa ${CHAT_FILE_MAX_COUNT} tệp`);
  }

  const attachments: MessageAttachmentInput[] = [];
  for (const file of files) {
    if (file.size > CHAT_FILE_MAX_SIZE) {
      throw new Error(`Tệp ${file.name} vượt quá 25MB`);
    }

    const path = chatFilePath(userId, file)

    const uploaded = await fileApi.upload({
      path,
      file,
      contentType: file.type || "application/octet-stream",
    });
    attachments.push({
      path: uploaded.path,
      name: file.name,
      mime: file.type || undefined,
      size: file.size || undefined,
    });
  }
  return attachments;
}
