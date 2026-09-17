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
    const offDeleted = connection.onMessageDeleted((payload) => {
      emitRealtimeEvent(RealtimeEvent.MessageDeleted, payload);
    });
    const offInbox = connection.onInboxUpdated((payload) => {
      emitRealtimeEvent(RealtimeEvent.InboxUpdated, payload);
    });

    return () => {
      offMessage();
      offDeleted();
      offInbox();
      connection.disconnect();
    };
  }, [token]);
}
