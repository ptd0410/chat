import { RealtimeEvent, realtimeApi } from "#/api/realtime";
import { useEffect } from "react";
import { emitRealtimeEvent } from "./realtime.event";

export function useRealtimeSocket(token: string) {
  useEffect(() => {
    if (!token) return;

    const connection = realtimeApi.connect(token);
    const offMessage = connection.onMessageCreated((payload) => {
      emitRealtimeEvent(RealtimeEvent.MessageCreated, payload);
    });
    const offUpdated = connection.onMessageUpdated((payload) => {
      emitRealtimeEvent(RealtimeEvent.MessageUpdated, payload);
    });
    const offDeleted = connection.onMessageDeleted((payload) => {
      emitRealtimeEvent(RealtimeEvent.MessageDeleted, payload);
    });
    const offReaction = connection.onMessageReactionUpdated((payload) => {
      emitRealtimeEvent(RealtimeEvent.MessageReactionUpdated, payload);
    });
    const offInbox = connection.onInboxUpdated((payload) => {
      emitRealtimeEvent(RealtimeEvent.InboxUpdated, payload);
    });

    return () => {
      offMessage();
      offUpdated();
      offDeleted();
      offReaction();
      offInbox();
      connection.disconnect();
    };
  }, [token]);
}
