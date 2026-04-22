import { io, Socket } from "socket.io-client";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
const SOCKET_URL = new URL(API_BASE_URL).origin;
let socket: Socket | null = null;
//* Function for get socket
export function getSocket(): Socket {
  if (socket) return socket;
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000
  });
  //* Function for this task
  socket.on("connect", () => {
    console.log("[socket] connected:", socket?.id);
  });
  //* Function for this task
  socket.on("disconnect", reason => {
    console.log("[socket] disconnected:", reason);
  });
  //* Function for this task
  socket.on("connect_error", err => {
    console.warn("[socket] connect_error:", err.message);
  });
  return socket;
}
//* Function for disconnect socket
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
export const EVENTS = {
  WORKSPACE_JOIN: "workspace:join",
  WORKSPACE_LEAVE: "workspace:leave",
  CHANNEL_CREATED: "workspace:channel:created",
  CHANNEL_DELETED: "workspace:channel:deleted",
  CHANNEL_UPDATED: "workspace:channel:updated",
  WORKSPACE_MEMBER_ADDED: "workspace:member:added",
  WORKSPACE_MEMBER_REMOVED: "workspace:member:removed",
  WORKSPACE_MEMBER_ROLE_CHANGED: "workspace:member:role:changed",
  BOARD_CREATED: "workspace:board:created",
  BOARD_DELETED: "workspace:board:deleted",
  BOARD_UPDATED: "workspace:board:updated",
  CHANNEL_JOIN: "channel:join",
  CHANNEL_LEAVE: "channel:leave",
  BOARD_JOIN: "board:join",
  BOARD_LEAVE: "board:leave",
  DM_JOIN: "dm:join",
  DM_LEAVE: "dm:leave",
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  TASK_MOVED: "task:moved",
  TASK_DELETED: "task:deleted",
  CHANNEL_MESSAGE_NEW: "channel:message:new",
  CHANNEL_MESSAGE_EDITED: "channel:message:edited",
  CHANNEL_MESSAGE_DELETED: "channel:message:deleted",
  CHANNEL_MESSAGE_REACTED: "channel:message:reacted",
  DM_MESSAGE_NEW: "dm:message:new",
  DM_MESSAGE_EDITED: "dm:message:edited",
  DM_MESSAGE_DELETED: "dm:message:deleted",
  DM_MESSAGE_REACTED: "dm:message:reacted",
  NOTIFICATION_NEW: "notification:new",
  CHANNEL_TYPING_START: "channel:typing:start",
  CHANNEL_TYPING_STOP: "channel:typing:stop",
  CHANNEL_USER_TYPING: "channel:user:typing",
  CHANNEL_USER_STOPPED_TYPING: "channel:user:stopped_typing",
  DM_TYPING_START: "dm:typing:start",
  DM_TYPING_STOP: "dm:typing:stop",
  DM_USER_TYPING: "dm:user:typing",
  DM_USER_STOPPED_TYPING: "dm:user:stopped_typing",
  CALL_OFFER: "call:offer",
  CALL_ANSWER: "call:answer",
  CALL_ICE_CANDIDATE: "call:ice-candidate",
  CALL_END: "call:end",
  CALL_REJECT: "call:reject",
  CALL_BUSY: "call:busy",
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  PRESENCE_SYNC: "presence:sync"
} as const;