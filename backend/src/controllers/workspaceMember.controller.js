import * as memberService from "../services/workspaceMember.service.js";
import { APP_EVENTS } from "../constants/appEvents.constant.js";
import {
  createNotification,
  notifyWorkspaceMembers,
} from "../services/notification.service.js";
import WorkspaceMember from "../models/WorkspaceMember.model.js";
import User from "../models/User.model.js";
import Workspace from "../models/Workspace.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for list members
export const list = asyncHandler(async (req, res) => {
  res.json(await memberService.listMembers(req.params.workspaceId));
});

//* Controller function for change role of member
export const changeRole = asyncHandler(async (req, res) => {
  const data = await memberService.changeMemberRole({
    workspaceId: req.params.workspaceId,
    memberId: req.params.memberId,
    role: req.body.role,
  });
  const io = req.app.get("io");
  io.to(`workspace:${req.params.workspaceId}`).emit(
    APP_EVENTS.WORKSPACE_MEMBER_ROLE_CHANGED,
    data,
  );
  const changer = await User.findById(req.user._id).select("fullName").lean();
  const ws = await Workspace.findById(req.params.workspaceId)
    .select("name")
    .lean();
  if (data.user?._id && String(data.user._id) !== String(req.user._id)) {
    await createNotification({
      userId: data.user._id,
      type: "role_changed",
      message: `${changer?.fullName || "Someone"} changed your role to ${req.body.role} in ${ws?.name || "the workspace"}`,
      meta: {
        role: req.body.role,
        actorName: changer?.fullName || "Someone",
        workspaceId: req.params.workspaceId,
        workspaceName: ws?.name,
      },
      io,
    });
  }
  res.json(data);
});

//* Controller function for remove member
export const remove = asyncHandler(async (req, res) => {
  const result = await memberService.removeMember({
    workspaceId: req.params.workspaceId,
    memberId: req.params.memberId,
    requesterId: req.user._id,
    requesterRole: req.workspaceMember?.role,
  });
  const io = req.app.get("io");
  io.to(`workspace:${req.params.workspaceId}`).emit(
    APP_EVENTS.WORKSPACE_MEMBER_REMOVED,
    {
      memberId: result.memberId,
      userId: result.userId,
      workspaceId: req.params.workspaceId,
    },
  );
  const remover = await User.findById(req.user._id).select("fullName").lean();
  const ws = await Workspace.findById(req.params.workspaceId)
    .select("name")
    .lean();
  if (result.userId !== String(req.user._id)) {
    await createNotification({
      userId: result.userId,
      type: "member_removed",
      message: `You were removed from workspace "${ws?.name || "a workspace"}" by ${remover?.fullName || "an admin"}`,
      meta: {
        actorName: remover?.fullName || "Someone",
        workspaceId: req.params.workspaceId,
        workspaceName: ws?.name,
      },
      io,
    });
  }
  res.json(result);
});
