import { apiClient } from "#/clients";
import { io, type Socket } from "socket.io-client";
import {
  RealtimeEvent,
  type RealtimeInboxUpdatedEvent,
  type RealtimeMessageCreatedEvent,
  type RealtimeMessageDeletedEvent,
} from "./realtime.type";

function realtimeUrl() {
  const base = apiClient.defaults.baseURL ?? "http://localhost:3000/api";
  return base.replace(/\/api\/?$/, "") + "/realtime";
}

export type RealtimeConnection = {
  onMessageCreated: (
    handler: (event: RealtimeMessageCreatedEvent) => void,
  ) => () => void;
  onMessageDeleted: (
    handler: (event: RealtimeMessageDeletedEvent) => void,
  ) => () => void;
  onInboxUpdated: (
    handler: (event: RealtimeInboxUpdatedEvent) => void,
  ) => () => void;
  disconnect: () => void;
};

export const realtimeApi = {
  connect(token: string): RealtimeConnection {
    const socket: Socket = io(realtimeUrl(), {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
    });

    return {
      onMessageCreated: (handler) => {
        socket.on(RealtimeEvent.MessageCreated, handler);
        return () => {
          socket.off(RealtimeEvent.MessageCreated, handler);
        };
      },
      onMessageDeleted: (handler) => {
        socket.on(RealtimeEvent.MessageDeleted, handler);
        return () => {
          socket.off(RealtimeEvent.MessageDeleted, handler);
        };
      },
      onInboxUpdated: (handler) => {
        socket.on(RealtimeEvent.InboxUpdated, handler);
        return () => {
          socket.off(RealtimeEvent.InboxUpdated, handler);
        };
      },
      disconnect: () => {
        socket.removeAllListeners();
        socket.disconnect();
      },
    };
  },
};
