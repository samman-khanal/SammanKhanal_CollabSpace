import * as channelService from "../services/channel.service.js";
import { HTTP } from "../constants/httpStatus.constant.js";
import { APP_EVENTS } from "../constants/appEvents.constant.js";
import { notifyWorkspaceMembers } from "../services/notification.service.js";
import WorkspaceMember from "../models/WorkspaceMember.model.js";
import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for create channel
export const create = asyncHandler(async (req, res) => {
  const c = await channelService.createChannel({
    workspaceId: req.params.workspaceId,
    name: req.body.name,
    type: req.body.type || "public",
    userId: req.user._id,
  });
  const io = req.app.get("io");
  io.to(`workspace:${req.params.workspaceId}`).emit(
    APP_EVENTS.CHANNEL_CREATED,
    c,
  );
  const creator = await User.findById(req.user._id).select("fullName").lean();
  const wsMembers = await WorkspaceMember.find({
    workspace: req.params.workspaceId,
  })
    .select("user")
    .lean();
  await notifyWorkspaceMembers({
    //* Controller function for member user ids
    memberUserIds: wsMembers.map((m) => m.user),
    excludeUserId: req.user._id,
    type: "channel_created",
    message: `${creator?.fullName || "Someone"} created a new channel #${c.name}`,
    meta: {
      channelId: String(c._id),
      channelName: c.name,
      actorName: creator?.fullName || "Someone",
      workspaceId: req.params.workspaceId,
    },
    io,
  });
  res.status(HTTP.CREATED).json(c);
});

//* Controller function for list channel
export const list = asyncHandler(async (req, res) => {
  const rows = await channelService.listChannels({
    workspaceId: req.params.workspaceId,
    userId: req.user._id,
  });
  res.json(rows);
});

//* Controller function for add members to channel
export const addMembers = asyncHandler(async (req, res) => {
  const channel = await channelService.addMembersToChannel({
    channelId: req.params.channelId,
    userIds: req.body.userIds || [],
  });
  if (!channel)
    return res.status(404).json({
      message: "Channel not found",
    });
  req.app
    .get("io")
    .to(`workspace:${String(channel.workspace)}`)
    .emit(APP_EVENTS.CHANNEL_UPDATED, channel);
  res.json(channel);
});

//* Controller function for update channel
export const update = asyncHandler(async (req, res) => {
  const channel = await channelService.updateChannel({
    channelId: req.params.channelId,
    name: req.body.name,
  });
  if (!channel)
    return res.status(404).json({
      message: "Channel not found",
    });
  req.app
    .get("io")
    .to(`workspace:${String(channel.workspace)}`)
    .emit(APP_EVENTS.CHANNEL_UPDATED, channel);
  res.json(channel);
});

//* Controller function for remove member from a channel
export const removeMember = asyncHandler(async (req, res) => {
  const channel = await channelService.removeMemberFromChannel({
    channelId: req.params.channelId,
    memberId: req.params.memberId,
  });
  req.app
    .get("io")
    .to(`workspace:${String(channel.workspace)}`)
    .emit(APP_EVENTS.CHANNEL_UPDATED, channel);
  res.json(channel);
});

//* Controller function for remove channel
export const remove = asyncHandler(async (req, res) => {
  const channel = await channelService.deleteChannel({
    channelId: req.params.channelId,
  });
  const io = req.app.get("io");
  io.to(`workspace:${String(channel.workspace)}`).emit(
    APP_EVENTS.CHANNEL_DELETED,
    {
      _id: String(channel._id),
    },
  );
  const deleter = await User.findById(req.user._id).select("fullName").lean();
  const wsMembers = await WorkspaceMember.find({
    workspace: channel.workspace,
  })
    .select("user")
    .lean();
  await notifyWorkspaceMembers({
    //* Controller function for member user ids
    memberUserIds: wsMembers.map((m) => m.user),
    excludeUserId: req.user._id,
    type: "channel_deleted",
    message: `${deleter?.fullName || "Someone"} deleted channel #${channel.name}`,
    meta: {
      channelName: channel.name,
      actorName: deleter?.fullName || "Someone",
      workspaceId: String(channel.workspace),
    },
    io,
  });
  res.json(channel);
});

//* Controller function for join channel
export const join = async (req, res, next) => {
  try {
    const c = await channelService.joinChannel({
      channelId: req.params.channelId,
      userId: req.user._id,
    });
    res.json(c);
  } catch (e) {
    next(e);
  }
};

//* Controller function for leave channel
export const leave = async (req, res, next) => {
  try {
    const c = await channelService.leaveChannel({
      channelId: req.params.channelId,
      userId: req.user._id,
    });
    res.json(c);
  } catch (e) {
    next(e);
  }
};
