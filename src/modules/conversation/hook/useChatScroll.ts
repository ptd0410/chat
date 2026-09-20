import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ChatMessageView } from "../conversation.view";

export function useChatScroll(input: {
  conversationId: number | null;
  messages: ChatMessageView[];
  hasOlder: boolean;
  loadingOlder: boolean;
  loadOlder: () => Promise<unknown>;
}) {
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const olderSentinelRef = useRef<HTMLDivElement>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoreRef = useRef<{ height: number; top: number } | null>(null);
  const initializedFor = useRef<number | null>(null);

  useLayoutEffect(() => {
    initializedFor.current = null;
    restoreRef.current = null;
  }, [input.conversationId]);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el || input.conversationId == null) return;
    const snap = restoreRef.current;
    if (snap) {
      el.scrollTop = el.scrollHeight - snap.height + snap.top;
      restoreRef.current = null;
      return;
    }
    if (initializedFor.current !== input.conversationId) {
      if (input.messages.length === 0) return;
      el.scrollTop = el.scrollHeight;
      initializedFor.current = input.conversationId;
      return;
    }
    const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (fromBottom < 140) {
      el.scrollTop = el.scrollHeight;
    }
  }, [input.messages, input.conversationId]);

  const loadOlder = useCallback(() => {
    const el = scrollerRef.current;
    if (!input.hasOlder || input.loadingOlder) return;
    if (el) {
      restoreRef.current = { height: el.scrollHeight, top: el.scrollTop };
    }
    void input.loadOlder();
  }, [input.hasOlder, input.loadingOlder, input.loadOlder]);

  useEffect(() => {
    const root = scrollerRef.current;
    const sentinel = olderSentinelRef.current;
    if (!root || !sentinel || !input.hasOlder) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadOlder();
      },
      { root, rootMargin: "80px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [input.hasOlder, loadOlder, input.messages.length]);

  useEffect(() => {
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, []);

  function jumpToMessage(id: number) {
    const target = document.getElementById(`message-${id}`);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedId(id);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => {
      setHighlightedId(null);
    }, 1400);
  }

  return {
    scrollerRef,
    olderSentinelRef,
    endRef,
    highlightedId,
    jumpToMessage,
  };
}
