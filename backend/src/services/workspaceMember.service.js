import WorkspaceMember from "../models/WorkspaceMember.model.js";
import { WORKSPACE_ROLES } from "../constants/workspaceRoles.constant.js";
import { AppError } from "../utils/AppError.util.js";
const VALID_ROLES = [WORKSPACE_ROLES.OWNER, WORKSPACE_ROLES.ADMIN, WORKSPACE_ROLES.MEMBER];
//* Function for list members
export const listMembers = async workspaceId => WorkspaceMember.find({
  workspace: workspaceId
}).populate("user", "fullName email avatarUrl");
//* Function for change member role
export const changeMemberRole = async ({
  workspaceId,
  memberId,
  role
}) => {
  if (!VALID_ROLES.includes(role)) throw new AppError("Invalid role", 400);
  const m = await WorkspaceMember.findOneAndUpdate({
    _id: memberId,
    workspace: workspaceId
  }, {
    role
  }, {
    new: true
  }).populate("user", "fullName email");
  if (!m) throw new AppError("Member not found", 404);
  return m;
};
//* Function for remove member
export const removeMember = async ({
  workspaceId,
  memberId,
  requesterId,
  requesterRole
}) => {
  const target = await WorkspaceMember.findOne({
    _id: memberId,
    workspace: workspaceId
  });
  if (!target) throw new AppError("Member not found", 404);
  if (target.role === WORKSPACE_ROLES.OWNER && String(target.user) === String(requesterId)) {
    throw new AppError("Owners cannot remove themselves from the workspace", 403);
  }
  if ((target.role === WORKSPACE_ROLES.OWNER || target.role === WORKSPACE_ROLES.ADMIN) && requesterRole !== WORKSPACE_ROLES.OWNER) {
    throw new AppError("Only the workspace owner can remove admins", 403);
  }
  await target.deleteOne();
  return {
    removed: true,
    memberId: String(target._id),
    userId: String(target.user)
  };
};