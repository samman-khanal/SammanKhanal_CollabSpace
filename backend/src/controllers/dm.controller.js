import * as dmService from "../services/dm.service.js";
import { HTTP } from "../constants/httpStatus.constant.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for create or get DM
export const createOrGet = asyncHandler(async (req, res) => {
  const dm = await dmService.createOrGetDM({
    workspaceId: req.params.workspaceId,
    userId: req.user._id,
    otherUserId: req.body.otherUserId,
  });
  res.status(HTTP.CREATED).json(dm);
});

//* Controller function for list mine DMs
export const listMine = asyncHandler(async (req, res) => {
  const rows = await dmService.listMyDMs({
    workspaceId: req.params.workspaceId,
    userId: req.user._id,
  });
  res.json(rows);
});
