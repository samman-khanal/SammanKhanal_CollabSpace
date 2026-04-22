import WorkspaceMember from "../models/WorkspaceMember.model.js";
import { HTTP } from "../constants/httpStatus.constant.js";

//* Function for require workspace member
export default async function requireWorkspaceMember(req, res, next) {
  const workspaceId = req.params.workspaceId;
  if (!workspaceId)
    return res.status(HTTP.BAD_REQUEST).json({
      message: "workspaceId required",
    });
  try {
    const member = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: req.user._id,
    });
    if (!member)
      return res.status(HTTP.FORBIDDEN).json({
        message: "Not a workspace member",
      });
    req.workspaceMember = member;
    next();
  } catch (err) {
    next(err);
  }
}
