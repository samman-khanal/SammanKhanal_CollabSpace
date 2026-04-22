import * as workspaceService from "../services/workspace.service.js";
import { HTTP } from "../constants/httpStatus.constant.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for create
export const create = asyncHandler(async (req, res) => {
  const ws = await workspaceService.createWorkspace({
    name: req.body.name,
    description: req.body.description,
    ownerId: req.user._id,
  });
  res.status(HTTP.CREATED).json(ws);
});

//* Controller function for list mine
export const listMine = asyncHandler(async (req, res) => {
  res.json(await workspaceService.listMyWorkspaces(req.user._id));
});

//* Controller function for get one
export const getOne = asyncHandler(async (req, res) => {
  res.json(await workspaceService.getWorkspace(req.params.workspaceId));
});

//* Controller function for update
export const update = asyncHandler(async (req, res) => {
  res.json(
    await workspaceService.updateWorkspace(req.params.workspaceId, req.body),
  );
});

//* Controller function for remove
export const remove = asyncHandler(async (req, res) => {
  res.json(await workspaceService.deleteWorkspace(req.params.workspaceId));
});
