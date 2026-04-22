import * as taskService from "../services/task.service.js";
import { HTTP } from "../constants/httpStatus.constant.js";
import { APP_EVENTS } from "../constants/appEvents.constant.js";
import { createNotification } from "../services/notification.service.js";
import User from "../models/User.model.js";
import Board from "../models/Board.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for create task
export const create = asyncHandler(async (req, res) => {
  const data = await taskService.createTask({
    boardId: req.params.boardId,
    columnId: req.params.columnId,
    title: req.body.title,
    description: req.body.description,
    assignees: req.body.assignees,
    dueDate: req.body.dueDate,
    priority: req.body.priority,
    checklist: req.body.checklist,
    userId: req.user._id,
  });
  const io = req.app.get("io");
  io.to(`board:${req.params.boardId}`).emit(APP_EVENTS.TASK_CREATED, data);
  if (data.assignees?.length) {
    const creator = await User.findById(req.user._id).select("fullName").lean();
    const board = await Board.findById(req.params.boardId)
      .select("name workspace")
      .lean();
    //* Controller function for create task
    await Promise.all(
      data.assignees
        .filter((id) => String(id) !== String(req.user._id))
        .map((uid) =>
          createNotification({
            userId: uid,
            type: "task_assigned",
            message: `${creator?.fullName || "Someone"} assigned you to task "${data.title}"`,
            meta: {
              taskId: String(data._id),
              taskTitle: data.title,
              boardId: req.params.boardId,
              boardName: board?.name,
              actorName: creator?.fullName || "Someone",
              workspaceId: String(board?.workspace),
            },
            io,
          }),
        ),
    );
  }
  res.status(HTTP.CREATED).json(data);
});

//* Controller function for list by board
export const listByBoard = asyncHandler(async (req, res) => {
  res.json(await taskService.listTasksByBoard(req.params.boardId));
});

//* Controller function for get one task
export const getOne = asyncHandler(async (req, res) => {
  res.json(await taskService.getTask(req.params.taskId));
});

//* Controller function for update task
export const update = asyncHandler(async (req, res) => {
  const data = await taskService.updateTask(
    req.params.taskId,
    req.body,
    req.user._id,
  );
  if (!data)
    return res.status(HTTP.NOT_FOUND).json({
      message: "Task not found",
    });
  const io = req.app.get("io");
  io.to(`board:${String(data.board)}`).emit(APP_EVENTS.TASK_UPDATED, data);
  if (req.body.assignees) {
    const updater = await User.findById(req.user._id).select("fullName").lean();
    const board = await Board.findById(data.board)
      .select("name workspace")
      .lean();
    //* Controller function for update task
    await Promise.all(
      (data.assignees || [])
        .filter((id) => String(id) !== String(req.user._id))
        .map((uid) =>
          createNotification({
            userId: uid,
            type: "task_assigned",
            message: `${updater?.fullName || "Someone"} assigned you to task "${data.title}"`,
            meta: {
              taskId: String(data._id),
              taskTitle: data.title,
              boardId: String(data.board),
              boardName: board?.name,
              actorName: updater?.fullName || "Someone",
              workspaceId: String(board?.workspace),
            },
            io,
          }),
        ),
    );
  }
  res.json(data);
});

//* Controller function for remove task
export const remove = asyncHandler(async (req, res) => {
  const result = await taskService.deleteTask(req.params.taskId);
  req.app
    .get("io")
    .to(`board:${result.boardId}`)
    .emit(APP_EVENTS.TASK_DELETED, {
      taskId: result.taskId,
    });
  res.json(result);
});

//* Controller function for move task
export const move = asyncHandler(async (req, res) => {
  const data = await taskService.moveTask({
    taskId: req.params.taskId,
    toColumnId: req.body.toColumnId,
    toOrder: req.body.toOrder,
  });
  req.app
    .get("io")
    .to(`board:${String(data.board)}`)
    .emit(APP_EVENTS.TASK_MOVED, data);
  res.json(data);
});

//* Controller function for my workspace tasks
export const myWorkspaceTasks = asyncHandler(async (req, res) => {
  res.json(
    await taskService.getMyWorkspaceTasks({
      workspaceId: req.params.workspaceId,
      userId: req.user._id,
    }),
  );
});

//* Controller function for reorder in column
export const reorderInColumn = asyncHandler(async (req, res) => {
  res.json(
    await taskService.reorderTasksInColumn({
      columnId: req.params.columnId,
      orderedIds: req.body.orderedIds,
    }),
  );
});
