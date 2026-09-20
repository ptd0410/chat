import { formatFileSize } from "#/modules/file-storage";
import { FileText, X } from "lucide-react";
import type { PendingFile } from "#/modules/draft";

export function PendingFileList({
  files,
  onRemove,
}: {
  files: PendingFile[];
  onRemove: (id: string) => void;
}) {
  if (!files.length) return null;

  return (
    <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
      {files.map((item) => (
        <div
          key={item.id}
          className="relative w-20 shrink-0 overflow-hidden rounded-xl bg-white/6 ring-1 ring-white/10"
        >
          {item.previewUrl ? (
            <img
              src={item.previewUrl}
              alt={item.file.name}
              className="h-20 w-20 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 flex-col items-center justify-center gap-1 px-1.5">
              <FileText className="size-5 text-white/70" />
              <p className="w-full truncate text-center text-[10px] text-white/55">
                {item.file.name}
              </p>
            </div>
          )}
          <p className="truncate px-1.5 pb-1 text-[10px] text-white/40">
            {formatFileSize(item.file.size)}
          </p>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white"
            aria-label={`Gỡ ${item.file.name}`}
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
