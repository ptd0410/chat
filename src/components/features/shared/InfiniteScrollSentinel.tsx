import { useEffect, useRef } from "react";

export function InfiniteScrollSentinel({
  enabled,
  loading,
  onLoadMore,
  label = "Đang tải thêm...",
}: {
  enabled: boolean;
  loading: boolean;
  onLoadMore: () => void;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, onLoadMore]);

  if (!enabled && !loading) return null;

  return (
    <div ref={ref} className="px-4 py-3 text-center text-[11px] text-white/35">
      {loading ? label : null}
    </div>
  );
}
