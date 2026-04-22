import Message from "../models/Message.model.js";
import Channel from "../models/Channel.model.js";
import WorkspaceMember from "../models/WorkspaceMember.model.js";
import User from "../models/User.model.js";
import DMConversation from "../models/DMConversation.model.js";
import { createNotification } from "./notification.service.js";
import { APP_EVENTS } from "../constants/appEvents.constant.js";
import { AppError } from "../utils/AppError.util.js";
//* Function for send channel message
export const sendChannelMessage = async ({
  channelId,
  senderId,
  content,
  file,
  mentions = [],
  io
}) => {
  const channel = await Channel.findById(channelId);
  if (!channel) throw new AppError("Channel not found", 404);
  //* Function for is member
  const isMember = channel.members.some(id => String(id) === String(senderId));
  if (!isMember) {
    if (channel.type === "private") {
      throw new AppError("Not a channel member", 403);
    }
    const wsMember = await WorkspaceMember.findOne({
      workspace: channel.workspace,
      user: senderId
    });
    if (!wsMember) throw new AppError("Not a workspace member", 403);
    channel.members.push(senderId);
    await channel.save();
  }
  const attachments = [];
  if (file) {
    attachments.push({
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      dataBase64: file.buffer.toString("base64")
    });
  }
  const msg = await Message.create({
    channel: channelId,
    dm: null,
    sender: senderId,
    content: content || "",
    attachments,
    mentions
  });
  if (mentions.length) {
    const sender = await User.findById(senderId).select("fullName");
    //* Function for send channel message
    await Promise.all(mentions.filter(id => String(id) !== String(senderId)).map(userId => createNotification({
      userId,
      type: "mention",
      message: `${sender?.fullName || "Someone"} mentioned you in #${channel.name}`,
      meta: {
        channelId,
        messageId: msg._id,
        senderName: sender?.fullName || "Unknown",
        senderId: String(senderId),
        channelName: channel.name,
        preview: (content || "").slice(0, 120)
      },
      io
    })));
  }
  const populated = await Message.findById(msg._id).populate("sender", "fullName email avatarUrl").populate("mentions", "fullName _id");
  if (io) io.to(`channel:${String(channelId)}`).emit(APP_EVENTS.CHANNEL_MESSAGE_NEW, populated);
  return populated;
};
//* Function for list channel messages
export const listChannelMessages = async ({
  channelId,
  userId,
  limit = 50
}) => {
  const channel = await Channel.findById(channelId);
  if (!channel) throw new AppError("Channel not found", 404);
  //* Function for is member
  const isMember = channel.members.some(id => String(id) === String(userId));
  if (!isMember) {
    if (channel.type === "private") {
      throw new AppError("Not a channel member", 403);
    }
    const wsMember = await WorkspaceMember.findOne({
      workspace: channel.workspace,
      user: userId
    });
    if (!wsMember) throw new AppError("Not a workspace member", 403);
    channel.members.push(userId);
    await channel.save();
  }
  return Message.find({
    channel: channelId
  }).populate("sender", "fullName email avatarUrl").populate("mentions", "fullName _id").sort({
    createdAt: -1
  }).limit(Math.min(Number(limit) || 50, 200));
};
//* Function for edit message
export const editMessage = async ({
  messageId,
  userId,
  newContent,
  io
}) => {
  const msg = await Message.findById(messageId);
  if (!msg) throw new AppError("Message not found", 404);
  if (String(msg.sender) !== String(userId)) throw new AppError("Forbidden", 403);
  if (msg.deletedAt) throw new AppError("Message deleted", 400);
  msg.content = newContent;
  msg.editedAt = new Date();
  await msg.save();
  const populated = await Message.findById(msg._id).populate("sender", "fullName email avatarUrl").populate("mentions", "fullName _id");
  if (io) {
    if (msg.channel) io.to(`channel:${String(msg.channel)}`).emit(APP_EVENTS.CHANNEL_MESSAGE_EDITED, populated);
    if (msg.dm) io.to(`dm:${String(msg.dm)}`).emit(APP_EVENTS.DM_MESSAGE_EDITED, populated);
  }
  return populated;
};
//* Function for delete message
export const deleteMessage = async ({
  messageId,
  userId,
  io
}) => {
  const msg = await Message.findById(messageId);
  if (!msg) throw new AppError("Message not found", 404);
  if (String(msg.sender) !== String(userId)) throw new AppError("Forbidden", 403);
  msg.deletedAt = new Date();
  await msg.save();
  if (io) {
    if (msg.channel) io.to(`channel:${String(msg.channel)}`).emit(APP_EVENTS.CHANNEL_MESSAGE_DELETED, {
      _id: msg._id
    });
    if (msg.dm) io.to(`dm:${String(msg.dm)}`).emit(APP_EVENTS.DM_MESSAGE_DELETED, {
      _id: msg._id
    });
  }
  return {
    deleted: true
  };
};
//* Function for toggle reaction
export const toggleReaction = async ({
  messageId,
  userId,
  emoji,
  io
}) => {
  const msg = await Message.findById(messageId);
  if (!msg) throw new AppError("Message not found", 404);
  if (msg.deletedAt) throw new AppError("Message deleted", 400);
  //* Function for idx
  const idx = msg.reactions.findIndex(r => r.emoji === emoji && String(r.user) === String(userId));
  if (idx >= 0) msg.reactions.splice(idx, 1);else msg.reactions.push({
    emoji,
    user: userId
  });
  await msg.save();
  const populated = await Message.findById(msg._id).populate("sender", "fullName email avatarUrl");
  if (io) {
    if (msg.channel) io.to(`channel:${String(msg.channel)}`).emit(APP_EVENTS.CHANNEL_MESSAGE_REACTED, populated);
    if (msg.dm) io.to(`dm:${String(msg.dm)}`).emit(APP_EVENTS.DM_MESSAGE_REACTED, populated);
  }
  return populated;
};
//* Function for send dmmessage
export const sendDMMessage = async ({
  dmId,
  senderId,
  content,
  file,
  mentions = [],
  io
}) => {
  const dm = await DMConversation.findById(dmId);
  if (!dm) throw new AppError("DM not found", 404);
  //* Function for is participant
  const isParticipant = dm.participants.some(id => String(id) === String(senderId));
  if (!isParticipant) throw new AppError("Not a DM participant", 403);
  const attachments = [];
  if (file) {
    attachments.push({
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      dataBase64: file.buffer.toString("base64")
    });
  }
  const msg = await Message.create({
    dm: dmId,
    channel: null,
    sender: senderId,
    content: content || "",
    attachments,
    mentions
  });
  //* Function for other user id
  const otherUserId = dm.participants.find(id => String(id) !== String(senderId));
  if (otherUserId) {
    const sender = await User.findById(senderId).select("fullName");
    await createNotification({
      userId: otherUserId,
      type: "dm_message",
      message: `${sender?.fullName || "Someone"} sent you a direct message`,
      meta: {
        dmId,
        messageId: msg._id,
        senderName: sender?.fullName || "Unknown",
        senderId: String(senderId),
        preview: (content || "").slice(0, 120)
      },
      io
    });
    if (mentions.length) {
      const sender2 = await User.findById(senderId).select("fullName");
      //* Function for send dmmessage
      await Promise.all(mentions.filter(id => String(id) !== String(senderId) && String(id) !== String(otherUserId)).map(userId => createNotification({
        userId,
        type: "mention",
        message: `${sender2?.fullName || "Someone"} mentioned you in a direct message`,
        meta: {
          dmId,
          messageId: msg._id,
          senderName: sender2?.fullName || "Unknown",
          senderId: String(senderId),
          preview: (content || "").slice(0, 120)
        },
        io
      })));
    }
  }
  const populated = await Message.findById(msg._id).populate("sender", "fullName email avatarUrl").populate("mentions", "fullName _id");
  if (io) io.to(`dm:${String(dmId)}`).emit(APP_EVENTS.DM_MESSAGE_NEW, populated);
  return populated;
};
//* Function for list dmmessages
export const listDMMessages = async ({
  dmId,
  userId,
  limit = 50
}) => {
  const dm = await DMConversation.findById(dmId);
  if (!dm) throw new AppError("DM not found", 404);
  //* Function for is participant
  const isParticipant = dm.participants.some(id => String(id) === String(userId));
  if (!isParticipant) throw new AppError("Not a DM participant", 403);
  return Message.find({
    dm: dmId
  }).populate("sender", "fullName email avatarUrl").populate("mentions", "fullName _id").sort({
    createdAt: -1
  }).limit(Math.min(Number(limit) || 50, 200));
};