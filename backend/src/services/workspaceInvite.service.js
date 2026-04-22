import WorkspaceInvite from "../models/WorkspaceInvite.model.js";
import Workspace from "../models/Workspace.model.js";
import WorkspaceMember from "../models/WorkspaceMember.model.js";
import User from "../models/User.model.js";
import { generateToken } from "../utils/generateToken.util.js";
import { sendEmail } from "../utils/sendEmail.util.js";
import { workspaceInviteTemplate } from "../utils/email/workspaceInvite.emai.js";
import { INVITATION_STATUS } from "../constants/invitationStatus.constant.js";
import { WORKSPACE_ROLES } from "../constants/workspaceRoles.constant.js";
import { AppError } from "../utils/AppError.util.js";
const twoDays = 48 * 60 * 60 * 1000;
//* Function for normalize email
const normalizeEmail = value => typeof value === "string" ? value.trim().toLowerCase() : "";
//* Function for get invite preview
export const getInvitePreview = async token => {
  const inv = await WorkspaceInvite.findOne({
    token
  }).populate("workspace", "name");
  if (!inv || inv.status !== INVITATION_STATUS.PENDING) throw new AppError("Invite not found or no longer valid", 404);
  if (inv.expiresAt < new Date()) throw new AppError("Invite expired", 400);
  return {
    workspaceName: inv.workspace?.name ?? "Unknown Workspace",
    email: inv.email,
    expiresAt: inv.expiresAt
  };
};
//* Function for create invite
export const createInvite = async ({
  workspaceId,
  email,
  invitedBy
}) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new AppError("Workspace not found", 404);
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) throw new AppError("Invite email is required", 400);
  const exists = await WorkspaceInvite.findOne({
    workspace: workspaceId,
    email: normalizedEmail,
    status: INVITATION_STATUS.PENDING
  });
  if (exists) throw new AppError("Invite already pending", 409);
  const token = generateToken(32);
  const invite = await WorkspaceInvite.create({
    workspace: workspaceId,
    email: normalizedEmail,
    invitedBy,
    token,
    expiresAt: new Date(Date.now() + twoDays)
  });
  const inviteUrl = `${process.env.FRONTEND_URL}/invite/accept?token=${token}`;
  await sendEmail({
    to: normalizedEmail,
    subject: `You're invited to ${workspace.name} - CollabSpace`,
    html: workspaceInviteTemplate({
      workspaceName: workspace.name,
      inviteUrl
    })
  });
  return invite;
};
//* Function for accept invite
export const acceptInvite = async ({
  token,
  userId
}) => {
  const inv = await WorkspaceInvite.findOneAndUpdate({
    token,
    status: INVITATION_STATUS.PENDING
  }, {
    status: INVITATION_STATUS.ACCEPTED
  }, {
    new: true
  });
  if (!inv) throw new AppError("Invalid or already used invite", 400);
  if (inv.expiresAt < new Date()) {
    await WorkspaceInvite.updateOne({
      _id: inv._id
    }, {
      status: INVITATION_STATUS.PENDING
    });
    throw new AppError("Invite expired", 400);
  }
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  const invitedEmail = normalizeEmail(inv.email);
  const userEmail = normalizeEmail(user.email);
  if (!invitedEmail || !userEmail || userEmail !== invitedEmail) {
    await WorkspaceInvite.updateOne({
      _id: inv._id
    }, {
      status: INVITATION_STATUS.PENDING
    });
    throw new AppError("Invite email mismatch", 403);
  }
  const member = await WorkspaceMember.findOneAndUpdate({
    workspace: inv.workspace,
    user: userId
  }, {
    $setOnInsert: {
      role: WORKSPACE_ROLES.MEMBER
    }
  }, {
    upsert: true,
    new: true
  }).populate("user", "fullName email avatarUrl");
  return {
    accepted: true,
    workspaceId: inv.workspace.toString(),
    member
  };
};
//* Function for reject invite
export const rejectInvite = async ({
  token,
  userId
}) => {
  const inv = await WorkspaceInvite.findOne({
    token,
    status: INVITATION_STATUS.PENDING
  });
  if (!inv) throw new AppError("Invalid invite", 400);
  const user = await User.findById(userId);
  const invitedEmail = normalizeEmail(inv.email);
  const userEmail = normalizeEmail(user?.email);
  if (!user || !invitedEmail || !userEmail || userEmail !== invitedEmail) {
    throw new AppError("Forbidden", 403);
  }
  inv.status = INVITATION_STATUS.REJECTED;
  await inv.save();
  return {
    rejected: true
  };
};
//* Function for list invites
export const listInvites = async workspaceId => WorkspaceInvite.find({
  workspace: workspaceId
});
//* Function for cancel invite
export const cancelInvite = async inviteId => {
  const inv = await WorkspaceInvite.findOneAndUpdate({
    _id: inviteId,
    status: INVITATION_STATUS.PENDING
  }, {
    status: INVITATION_STATUS.CANCELLED
  });
  if (!inv) throw new AppError("Invite not found or already resolved", 404);
  return {
    cancelled: true
  };
};