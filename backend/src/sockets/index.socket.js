import { Server } from "socket.io";
import { corsOptions } from "../config/cors.config.js";
import { verifyToken } from "../utils/jwt.util.js";
import { APP_EVENTS } from "../constants/appEvents.constant.js";
import DMConversation from "../models/DMConversation.model.js";
import WorkspaceMember from "../models/WorkspaceMember.model.js";
import { AppError } from "../utils/AppError.util.js";

//* Function for init sockets
export const initSockets = (httpServer, app) => {
  const io = new Server(httpServer, {
    cors: corsOptions,
  });
  const userSockets = new Map();
  const userWorkspaces = new Map();
  const workspaceOnlineUsers = new Map();

  //* Function for assert dm participants
  const assertDmParticipants = async ({ dmId, fromUserId, toUserId }) => {
    if (!dmId) throw new AppError("dmId is required", 400);
    if (!toUserId) throw new AppError("toUserId is required", 400);
    const dm = await DMConversation.findById(dmId).select("participants");
    if (!dm) throw new AppError("DM not found", 404);
    //* Function for participants
    const participants = dm.participants.map((p) => String(p));
    const from = String(fromUserId);
    const to = String(toUserId);
    if (!participants.includes(from))
      throw new AppError("Not a participant of this DM", 403);
    if (!participants.includes(to))
      throw new AppError("Target user is not in this DM", 403);
  };

  //* Function for init sockets
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));
      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  //* Function for init sockets
  io.on("connection", (socket) => {
    const uid = socket.userId;
    if (!userSockets.has(uid)) userSockets.set(uid, new Set());
    userSockets.get(uid).add(socket.id);
    if (!userWorkspaces.has(uid)) userWorkspaces.set(uid, new Set());
    socket.join(`user:${uid}`);
    //* Function for init sockets
    socket.on(APP_EVENTS.WORKSPACE_JOIN, async (workspaceId, ack) => {
      try {
        const member = await WorkspaceMember.findOne({
          workspace: workspaceId,
          user: uid,
        });
        if (!member) {
          ack?.({
            ok: false,
            onlineUsers: [],
          });
          return;
        }
        socket.join(`workspace:${workspaceId}`);
        userWorkspaces.get(uid).add(workspaceId);
        if (!workspaceOnlineUsers.has(workspaceId))
          workspaceOnlineUsers.set(workspaceId, new Set());
        workspaceOnlineUsers.get(workspaceId).add(uid);
        socket.to(`workspace:${workspaceId}`).emit(APP_EVENTS.USER_ONLINE, {
          userId: uid,
          workspaceId,
        });
        const onlineUsers = [...(workspaceOnlineUsers.get(workspaceId) || [])];
        ack?.({
          ok: true,
          onlineUsers,
        });
      } catch {
        ack?.({
          ok: false,
          onlineUsers: [],
        });
      }
    });

    //* Function for init sockets
    socket.on(APP_EVENTS.WORKSPACE_LEAVE, (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
      //* Function for still in workspace
      const stillInWorkspace = [...(userSockets.get(uid) || [])].some(
        (sid) =>
          sid !== socket.id &&
          io.sockets.sockets.get(sid)?.rooms?.has(`workspace:${workspaceId}`),
      );
      if (!stillInWorkspace) {
        userWorkspaces.get(uid)?.delete(workspaceId);
        workspaceOnlineUsers.get(workspaceId)?.delete(uid);
        io.to(`workspace:${workspaceId}`).emit(APP_EVENTS.USER_OFFLINE, {
          userId: uid,
          workspaceId,
        });
      }
    });

    //* Function for init sockets
    socket.on(APP_EVENTS.CHANNEL_JOIN, (channelId) =>
      socket.join(`channel:${channelId}`),
    );

    //* Function for init sockets
    socket.on(APP_EVENTS.CHANNEL_LEAVE, (channelId) =>
      socket.leave(`channel:${channelId}`),
    );

    //* Function for init sockets
    socket.on(APP_EVENTS.BOARD_JOIN, async (boardId) => {
      try {
        const Board = (await import("../models/Board.model.js")).default;
        const board = await Board.findById(boardId).select("workspace");
        if (!board) return;
        const member = await WorkspaceMember.findOne({
          workspace: board.workspace,
          user: socket.userId,
        });
        if (member) socket.join(`board:${boardId}`);
      } catch {}
    });

    //* Function for init sockets
    socket.on(APP_EVENTS.BOARD_LEAVE, (boardId) =>
      socket.leave(`board:${boardId}`),
    );

    //* Function for init sockets
    socket.on(APP_EVENTS.DM_JOIN, (dmId) => socket.join(`dm:${dmId}`));

    //* Function for init sockets
    socket.on(APP_EVENTS.DM_LEAVE, (dmId) => socket.leave(`dm:${dmId}`));

    //* Function for init sockets
    socket.on(APP_EVENTS.CALL_OFFER, async (payload, ack) => {
      try {
        const { dmId, toUserId, callId, type, sdp } = payload || {};
        await assertDmParticipants({
          dmId,
          fromUserId: socket.userId,
          toUserId,
        });
        io.to(`user:${toUserId}`).emit(APP_EVENTS.CALL_OFFER, {
          dmId,
          callId,
          type,
          sdp,
          fromUserId: socket.userId,
        });
        ack?.({
          ok: true,
        });
      } catch (e) {
        ack?.({
          ok: false,
          message: e?.message || "Failed to send offer",
        });
      }
    });

    //* Function for init sockets
    socket.on(APP_EVENTS.CALL_ANSWER, async (payload, ack) => {
      try {
        const { dmId, toUserId, callId, sdp } = payload || {};
        await assertDmParticipants({
          dmId,
          fromUserId: socket.userId,
          toUserId,
        });
        io.to(`user:${toUserId}`).emit(APP_EVENTS.CALL_ANSWER, {
          dmId,
          callId,
          sdp,
          fromUserId: socket.userId,
        });
        ack?.({
          ok: true,
        });
      } catch (e) {
        ack?.({
          ok: false,
          message: e?.message || "Failed to send answer",
        });
      }
    });

    //* Function for init sockets
    socket.on(APP_EVENTS.CALL_ICE_CANDIDATE, async (payload, ack) => {
      try {
        const { dmId, toUserId, callId, candidate } = payload || {};
        await assertDmParticipants({
          dmId,
          fromUserId: socket.userId,
          toUserId,
        });
        io.to(`user:${toUserId}`).emit(APP_EVENTS.CALL_ICE_CANDIDATE, {
          dmId,
          callId,
          candidate,
          fromUserId: socket.userId,
        });
        ack?.({
          ok: true,
        });
      } catch (e) {
        ack?.({
          ok: false,
          message: e?.message || "Failed to send ICE",
        });
      }
    });

    //* Function for init sockets
    socket.on(APP_EVENTS.CALL_END, async (payload, ack) => {
      try {
        const { dmId, toUserId, callId, reason } = payload || {};
        await assertDmParticipants({
          dmId,
          fromUserId: socket.userId,
          toUserId,
        });
        io.to(`user:${toUserId}`).emit(APP_EVENTS.CALL_END, {
          dmId,
          callId,
          reason,
          fromUserId: socket.userId,
        });
        ack?.({
          ok: true,
        });
      } catch (e) {
        ack?.({
          ok: false,
          message: e?.message || "Failed to end call",
        });
      }
    });

    //* Function for init sockets
    socket.on(APP_EVENTS.CALL_REJECT, async (payload, ack) => {
      try {
        const { dmId, toUserId, callId, reason } = payload || {};
        await assertDmParticipants({
          dmId,
          fromUserId: socket.userId,
          toUserId,
        });
        io.to(`user:${toUserId}`).emit(APP_EVENTS.CALL_REJECT, {
          dmId,
          callId,
          reason,
          fromUserId: socket.userId,
        });
        ack?.({
          ok: true,
        });
      } catch (e) {
        ack?.({
          ok: false,
          message: e?.message || "Failed to reject call",
        });
      }
    });

    //* Function for init sockets
    socket.on(APP_EVENTS.CALL_BUSY, async (payload, ack) => {
      try {
        const { dmId, toUserId, callId } = payload || {};
        await assertDmParticipants({
          dmId,
          fromUserId: socket.userId,
          toUserId,
        });
        io.to(`user:${toUserId}`).emit(APP_EVENTS.CALL_BUSY, {
          dmId,
          callId,
          fromUserId: socket.userId,
        });
        ack?.({
          ok: true,
        });
      } catch (e) {
        ack?.({
          ok: false,
          message: e?.message || "Failed to send busy",
        });
      }
    });

    //* Function for init sockets
    socket.on("disconnect", () => {
      const sockets = userSockets.get(uid);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(uid);
          const workspaces = userWorkspaces.get(uid) || new Set();
          for (const workspaceId of workspaces) {
            workspaceOnlineUsers.get(workspaceId)?.delete(uid);
            io.to(`workspace:${workspaceId}`).emit(APP_EVENTS.USER_OFFLINE, {
              userId: uid,
              workspaceId,
            });
          }
          userWorkspaces.delete(uid);
        }
      }
    });
  });
  app.set("io", io);
  console.log("Socket.IO ready and listening for connections");
  return io;
};
