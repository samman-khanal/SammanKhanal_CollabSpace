import Channel from "../models/Channel.model.js";
import WorkspaceMember from "../models/WorkspaceMember.model.js";
import { WORKSPACE_ROLES } from "../constants/workspaceRoles.constant.js";
import { AppError } from "../utils/AppError.util.js";
//* Function for create channel
export const createChannel = async ({
  workspaceId,
  name,
  type = "public",
  userId
}) => {
  const wsMember = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId
  });
  if (!wsMember) throw new AppError("Not a workspace member", 403);
  if (type === "private" && wsMember.role === WORKSPACE_ROLES.MEMBER) {
    throw new AppError("Only workspace admins or owners can create private channels", 403);
  }
  return Channel.create({
    workspace: workspaceId,
    name,
    type,
    createdBy: userId,
    members: [userId]
  });
};
//* Function for list channels
export const listChannels = async ({
  workspaceId,
  userId
}) => {
  const wsMember = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId
  });
  if (!wsMember) throw new AppError("Not a workspace member", 403);
  return Channel.find({
    workspace: workspaceId,
    $or: [{
      type: "public"
    }, {
      members: userId
    }]
  }).sort({
    createdAt: -1
  });
};
//* Function for add members to channel
export const addMembersToChannel = async ({
  channelId,
  userIds
}) => {
  return Channel.findByIdAndUpdate(channelId, {
    $addToSet: {
      members: {
        $each: userIds
      }
    }
  }, {
    new: true
  });
};
//* Function for update channel
export const updateChannel = async ({
  channelId,
  name
}) => {
  const patch = {};
  if (typeof name === "string" && name.trim()) patch.name = name.trim();
  return Channel.findByIdAndUpdate(channelId, patch, {
    new: true,
    runValidators: true
  });
};
//* Function for remove member from channel
export const removeMemberFromChannel = async ({
  channelId,
  memberId
}) => {
  const channel = await Channel.findById(channelId);
  if (!channel) throw new AppError("Channel not found", 404);
  if (String(channel.createdBy) === String(memberId)) {
    throw new AppError("Cannot remove the channel creator", 400);
  }
  //* Function for members
  channel.members = (channel.members || []).filter(userId => String(userId) !== String(memberId));
  await channel.save();
  return channel;
};
//* Function for delete channel
export const deleteChannel = async ({
  channelId
}) => {
  const channel = await Channel.findByIdAndDelete(channelId);
  if (!channel) throw new AppError("Channel not found", 404);
  return channel;
};
//* Function for join channel
export const joinChannel = async ({
  channelId,
  userId
}) => {
  const channel = await Channel.findById(channelId);
  if (!channel) throw new AppError("Channel not found", 404);
  const wsMember = await WorkspaceMember.findOne({
    workspace: channel.workspace,
    user: userId
  });
  if (!wsMember) throw new AppError("Not a workspace member", 403);
  if (channel.type === "private") {
    throw new AppError("Private channel: invite required", 403);
  }
  return Channel.findByIdAndUpdate(channelId, {
    $addToSet: {
      members: userId
    }
  }, {
    new: true
  });
};
//* Function for leave channel
export const leaveChannel = async ({
  channelId,
  userId
}) => Channel.findByIdAndUpdate(channelId, {
  $pull: {
    members: userId
  }
}, {
  new: true
});