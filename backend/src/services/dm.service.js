import DMConversation from "../models/DMConversation.model.js";
import WorkspaceMember from "../models/WorkspaceMember.model.js";
import { AppError } from "../utils/AppError.util.js";
//* Function for sorted pair
const sortedPair = (a, b) => [String(a), String(b)].sort();
//* Function for create or get dm
export const createOrGetDM = async ({
  workspaceId,
  userId,
  otherUserId
}) => {
  const isSelf = String(userId) === String(otherUserId);
  if (isSelf) {
    const m = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: userId
    });
    if (!m) throw new AppError("Not a workspace member", 403);
    const participants = [String(userId)];
    const existing = await DMConversation.findOne({
      workspace: workspaceId,
      participants
    });
    if (existing) return existing;
    return DMConversation.create({
      workspace: workspaceId,
      participants
    });
  }
  const [m1, m2] = await Promise.all([WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId
  }), WorkspaceMember.findOne({
    workspace: workspaceId,
    user: otherUserId
  })]);
  if (!m1 || !m2) throw new AppError("Both users must be workspace members", 403);
  const participants = sortedPair(userId, otherUserId);
  const existing = await DMConversation.findOne({
    workspace: workspaceId,
    participants
  });
  if (existing) return existing;
  return DMConversation.create({
    workspace: workspaceId,
    participants
  });
};
//* Function for list my dms
export const listMyDMs = async ({
  workspaceId,
  userId
}) => {
  const wsMember = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId
  });
  if (!wsMember) throw new AppError("Not a workspace member", 403);
  return DMConversation.find({
    workspace: workspaceId,
    participants: userId
  }).sort({
    updatedAt: -1
  });
};