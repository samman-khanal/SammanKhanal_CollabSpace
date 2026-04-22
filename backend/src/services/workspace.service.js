import Workspace from "../models/Workspace.model.js";
import WorkspaceMember from "../models/WorkspaceMember.model.js";
import { WORKSPACE_ROLES } from "../constants/workspaceRoles.constant.js";
import { AppError } from "../utils/AppError.util.js";
//* Function for create workspace
export const createWorkspace = async ({
  name,
  description = "",
  ownerId
}) => {
  const ws = await Workspace.create({
    name,
    description,
    owner: ownerId
  });
  await WorkspaceMember.create({
    workspace: ws._id,
    user: ownerId,
    role: WORKSPACE_ROLES.OWNER
  });
  return ws;
};
//* Function for list my workspaces
export const listMyWorkspaces = async userId => {
  const memberships = await WorkspaceMember.find({
    user: userId
  }).populate("workspace");
  //* Function for workspace ids
  const workspaceIds = memberships.map(m => m.workspace?._id).filter(Boolean);
  const memberCounts = workspaceIds.length ? await WorkspaceMember.aggregate([{
    $match: {
      workspace: {
        $in: workspaceIds
      }
    }
  }, {
    $group: {
      _id: "$workspace",
      count: {
        $sum: 1
      }
    }
  }]) : [];
  //* Function for count by workspace id
  const countByWorkspaceId = new Map(memberCounts.map(c => [String(c._id), c.count]));
  //* Function for list my workspaces
  return memberships.filter(m => !!m.workspace).map(m => ({
    ...m.workspace.toObject(),
    myRole: m.role,
    memberCount: countByWorkspaceId.get(String(m.workspace._id)) ?? 1
  }));
};
//* Function for get workspace
export const getWorkspace = async workspaceId => {
  const ws = await Workspace.findById(workspaceId);
  if (!ws) throw new AppError("Workspace not found", 404);
  return ws;
};
//* Function for update workspace
export const updateWorkspace = async (workspaceId, patch) => {
  const ws = await Workspace.findByIdAndUpdate(workspaceId, {
    ...(patch.name !== undefined ? {
      name: patch.name.trim()
    } : {}),
    ...(patch.description !== undefined ? {
      description: patch.description
    } : {})
  }, {
    new: true
  });
  if (!ws) throw new AppError("Workspace not found", 404);
  return ws;
};
//* Function for delete workspace
export const deleteWorkspace = async workspaceId => {
  await WorkspaceMember.deleteMany({
    workspace: workspaceId
  });
  await Workspace.deleteOne({
    _id: workspaceId
  });
  return {
    deleted: true
  };
};