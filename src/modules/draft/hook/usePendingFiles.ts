import {
  CHAT_FILE_MAX_COUNT,
  CHAT_FILE_MAX_SIZE,
} from "#/modules/file-storage";
import { useEffect, useRef, useState } from "react";

export type PendingFile = {
  id: string;
  file: File;
  previewUrl?: string;
};

function revokePreview(item: PendingFile) {
  if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
}

export function usePendingFiles({
  disabled,
  editing,
}: {
  disabled?: boolean;
  editing?: boolean;
}) {
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const filesRef = useRef<PendingFile[]>([]);
  filesRef.current = files;

  useEffect(() => {
    return () => {
      filesRef.current.forEach(revokePreview);
    };
  }, []);

  function addFiles(list: FileList | File[]) {
    if (disabled || editing) return;
    const incoming = Array.from(list);
    if (!incoming.length) return;
    setFileError(null);

    setFiles((prev) => {
      const next = [...prev];
      for (const file of incoming) {
        if (next.length >= CHAT_FILE_MAX_COUNT) {
          setFileError(`Chỉ gửi tối đa ${CHAT_FILE_MAX_COUNT} tệp`);
          break;
        }
        if (file.size > CHAT_FILE_MAX_SIZE) {
          setFileError(`Tệp ${file.name} vượt quá 25MB`);
          continue;
        }
        next.push({
          id: crypto.randomUUID(),
          file,
          previewUrl: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined,
        });
      }
      return next;
    });
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) revokePreview(target);
      return prev.filter((item) => item.id !== id);
    });
    setFileError(null);
  }

  function clearFiles() {
    setFiles((prev) => {
      prev.forEach(revokePreview);
      return [];
    });
    setFileError(null);
  }

  return {
    files,
    fileError,
    addFiles,
    removeFile,
    clearFiles,
  };
}
