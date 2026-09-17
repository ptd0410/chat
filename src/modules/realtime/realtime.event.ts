import {
  RealtimeEvent,
  type RealtimeInboxUpdatedEvent,
  type RealtimeMessageCreatedEvent,
  type RealtimeMessageDeletedEvent,
} from "#/api/realtime";

type Handler<T> = (payload: T) => void;

const listeners = new Map<string, Set<Handler<unknown>>>();

export function onRealtimeEvent<T>(event: string, handler: Handler<T>) {
  let set = listeners.get(event);
  if (!set) {
    set = new Set();
    listeners.set(event, set);
  }
  const wrapped: Handler<unknown> = (payload) => handler(payload as T);
  set.add(wrapped);
  return () => {
    set.delete(wrapped);
    if (set.size === 0) {
      listeners.delete(event);
    }
  };
}

export function emitRealtimeEvent(event: string, payload: unknown) {
  listeners.get(event)?.forEach((handler) => handler(payload));
}

export function onMessageCreated(
  handler: Handler<RealtimeMessageCreatedEvent>,
) {
  return onRealtimeEvent(RealtimeEvent.MessageCreated, handler);
}

export function onMessageDeleted(
  handler: Handler<RealtimeMessageDeletedEvent>,
) {
  return onRealtimeEvent(RealtimeEvent.MessageDeleted, handler);
}

export function onInboxUpdated(handler: Handler<RealtimeInboxUpdatedEvent>) {
  return onRealtimeEvent(RealtimeEvent.InboxUpdated, handler);
}
