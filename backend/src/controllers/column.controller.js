import * as columnService from "../services/column.service.js";
import { HTTP } from "../constants/httpStatus.constant.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for create column
export const create = asyncHandler(async (req, res) => {
  res.status(HTTP.CREATED).json(
    await columnService.createColumn({
      boardId: req.params.boardId,
      title: req.body.title,
    }),
  );
});

//* Controller function for list columns
export const list = asyncHandler(async (req, res) => {
  res.json(await columnService.listColumns(req.params.boardId));
});

//* Controller function for update column
export const update = asyncHandler(async (req, res) => {
  res.json(await columnService.updateColumn(req.params.columnId, req.body));
});

//* Controller function for remove column
export const remove = asyncHandler(async (req, res) => {
  res.json(await columnService.deleteColumn(req.params.columnId));
});

//* Controller function for reorder columns
export const reorder = asyncHandler(async (req, res) => {
  res.json(
    await columnService.reorderColumns({
      boardId: req.params.boardId,
      orderedIds: req.body.orderedIds,
    }),
  );
});
