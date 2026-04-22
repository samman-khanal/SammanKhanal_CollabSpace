import * as boardService from "../services/board.service.js";
import { HTTP } from "../constants/httpStatus.constant.js";
import { APP_EVENTS } from "../constants/appEvents.constant.js";
import { notifyWorkspaceMembers } from "../services/notification.service.js";
import WorkspaceMember from "../models/WorkspaceMember.model.js";
import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for create board
export const create = asyncHandler(async (req, res) => {
  const data = await boardService.createBoard({
    workspaceId: req.params.workspaceId,
    name: req.body.name,
    userId: req.user._id,
    methodology: req.body.methodology,
  });
  const io = req.app.get("io");
  io.to(`workspace:${req.params.workspaceId}`).emit(
    APP_EVENTS.BOARD_CREATED,
    data,
  );
  const creator = await User.findById(req.user._id).select("fullName").lean();
  const wsMembers = await WorkspaceMember.find({
    workspace: req.params.workspaceId,
  })
    .select("user")
    .lean();
  await notifyWorkspaceMembers({
    //* Controller function for member user ids
    memberUserIds: wsMembers.map((m) => m.user),
    excludeUserId: req.user._id,
    type: "board_created",
    message: `${creator?.fullName || "Someone"} created a new board "${data.name}"`,
    meta: {
      boardId: String(data._id),
      boardName: data.name,
      actorName: creator?.fullName || "Someone",
      workspaceId: req.params.workspaceId,
    },
    io,
  });
  res.status(HTTP.CREATED).json(data);
});

//* Controller function for list boards
export const list = asyncHandler(async (req, res) => {
  res.json(await boardService.listBoards(req.params.workspaceId));
});

//* Controller function for get one board
export const getOne = asyncHandler(async (req, res) => {
  res.json(await boardService.getBoard(req.params.boardId));
});

//* Controller function for update board
export const update = asyncHandler(async (req, res) => {
  const board = await boardService.updateBoard(req.params.boardId, req.body);
  if (!board)
    return res.status(404).json({
      message: "Board not found",
    });
  req.app
    .get("io")
    .to(`workspace:${String(board.workspace)}`)
    .emit(APP_EVENTS.BOARD_UPDATED, board);
  res.json(board);
});

//* Controller function for remove board
export const remove = asyncHandler(async (req, res) => {
  const result = await boardService.deleteBoard(req.params.boardId);
  const io = req.app.get("io");
  io.to(`workspace:${result.workspaceId}`).emit(APP_EVENTS.BOARD_DELETED, {
    boardId: result.boardId,
  });
  const deleter = await User.findById(req.user._id).select("fullName").lean();
  const wsMembers = await WorkspaceMember.find({
    workspace: result.workspaceId,
  })
    .select("user")
    .lean();
  await notifyWorkspaceMembers({
    //* Controller function for member user ids
    memberUserIds: wsMembers.map((m) => m.user),
    excludeUserId: req.user._id,
    type: "board_deleted",
    message: `${deleter?.fullName || "Someone"} deleted a board`,
    meta: {
      boardId: result.boardId,
      actorName: deleter?.fullName || "Someone",
      workspaceId: result.workspaceId,
    },
    io,
  });
  res.json(result);
});
