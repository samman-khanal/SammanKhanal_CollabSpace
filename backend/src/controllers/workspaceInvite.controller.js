import * as inviteService from "../services/workspaceInvite.service.js";
import { HTTP } from "../constants/httpStatus.constant.js";
import { APP_EVENTS } from "../constants/appEvents.constant.js";
import { notifyWorkspaceMembers } from "../services/notification.service.js";
import WorkspaceMember from "../models/WorkspaceMember.model.js";
import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for get by token
export const getByToken = asyncHandler(async (req, res) => {
  res.json(await inviteService.getInvitePreview(req.params.token));
});

//* Controller function for create invite
export const create = asyncHandler(async (req, res) => {
  const inv = await inviteService.createInvite({
    workspaceId: req.params.workspaceId,
    email: req.body.email,
    invitedBy: req.user._id,
  });
  res.status(HTTP.CREATED).json(inv);
});

//* Controller function for list invites
export const list = asyncHandler(async (req, res) => {
  res.json(await inviteService.listInvites(req.params.workspaceId));
});

//* Controller function for accept invite
export const accept = asyncHandler(async (req, res) => {
  const result = await inviteService.acceptInvite({
    token: req.params.token,
    userId: req.user._id,
  });
  const io = req.app.get("io");
  if (result.member) {
    io.to(`workspace:${result.workspaceId}`).emit(
      APP_EVENTS.WORKSPACE_MEMBER_ADDED,
      result.member,
    );
    const joiner = await User.findById(req.user._id).select("fullName").lean();
    const wsMembers = await WorkspaceMember.find({
      workspace: result.workspaceId,
    })
      .select("user")
      .lean();
    await notifyWorkspaceMembers({
      //* Controller function for member user ids
      memberUserIds: wsMembers.map((m) => m.user),
      excludeUserId: req.user._id,
      type: "member_joined",
      message: `${joiner?.fullName || "Someone"} joined the workspace`,
      meta: {
        userId: String(req.user._id),
        userName: joiner?.fullName || "Someone",
        workspaceId: result.workspaceId,
      },
      io,
    });
  }
  res.json(result);
});

//* Controller function for reject invite
export const reject = asyncHandler(async (req, res) => {
  res.json(
    await inviteService.rejectInvite({
      token: req.params.token,
      userId: req.user._id,
    }),
  );
});

//* Controller function for cancel invite
export const cancel = asyncHandler(async (req, res) => {
  res.json(await inviteService.cancelInvite(req.params.inviteId));
});
