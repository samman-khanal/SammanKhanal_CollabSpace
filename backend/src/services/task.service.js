import Task from "../models/Task.model.js";
import Column from "../models/Column.model.js";
import User from "../models/User.model.js";
import Board from "../models/Board.model.js";
import Workspace from "../models/Workspace.model.js";
import { sendEmail } from "../utils/sendEmail.util.js";
import { taskAssignedTemplate } from "../utils/email/taskAssigned.emai.js";
import { AppError } from "../utils/AppError.util.js";
import { toIdString, normalizeIds, buildTaskUrl } from "../utils/validators.util.js";
//* Function for normalize assignees
const normalizeAssignees = assignees => normalizeIds(assignees);
//* Function for load assignment mail context
const loadAssignmentMailContext = async ({
  boardId,
  assignedByUserId
}) => {
  const [board, assignedBy] = await Promise.all([Board.findById(boardId).select("name workspace").lean(), User.findById(assignedByUserId).select("fullName").lean()]);
  const workspace = board?.workspace ? await Workspace.findById(board.workspace).select("name").lean() : null;
  return {
    workspaceName: workspace?.name || "your workspace",
    boardName: board?.name || "your board",
    assignedByName: assignedBy?.fullName || "A teammate"
  };
};
//* Function for notify new assignees
const notifyNewAssignees = async ({
  task,
  nextAssigneeIds,
  previousAssigneeIds = [],
  assignedByUserId
}) => {
  if (!assignedByUserId) return;
  const previousSet = new Set(previousAssigneeIds.map(toIdString));
  //* Function for newly assigned ids
  const newlyAssignedIds = nextAssigneeIds.filter(id => !previousSet.has(toIdString(id)));
  if (!newlyAssignedIds.length) return;
  const assignees = await User.find({
    _id: {
      $in: newlyAssignedIds
    }
  }).select("fullName email").lean();
  if (!assignees.length) return;
  const context = await loadAssignmentMailContext({
    boardId: task.board,
    assignedByUserId
  });
  const taskUrl = buildTaskUrl(task.board);
  //* Function for notify new assignees
  await Promise.allSettled(assignees.filter(assignee => Boolean(assignee.email)).map(assignee => sendEmail({
    to: assignee.email,
    subject: `New task assigned: ${task.title}`,
    html: taskAssignedTemplate({
      assigneeName: assignee.fullName,
      taskTitle: task.title,
      dueDate: task.dueDate,
      priority: task.priority,
      workspaceName: context.workspaceName,
      boardName: context.boardName,
      assignedByName: context.assignedByName,
      taskUrl
    })
  })));
};
//* Function for create task
export const createTask = async ({
  boardId,
  columnId,
  title,
  description,
  assignees,
  dueDate,
  priority,
  checklist,
  userId
}) => {
  const count = await Task.countDocuments({
    column: columnId
  });
  const normalizedAssignees = normalizeAssignees(assignees);
  const task = await Task.create({
    board: boardId,
    column: columnId,
    title,
    ...(description !== undefined ? {
      description
    } : {}),
    ...(dueDate !== undefined ? {
      dueDate
    } : {}),
    ...(priority !== undefined ? {
      priority
    } : {}),
    ...(checklist !== undefined ? {
      checklist
    } : {}),
    assignees: normalizedAssignees,
    createdBy: userId,
    order: count
  });
  await notifyNewAssignees({
    task,
    nextAssigneeIds: normalizedAssignees,
    assignedByUserId: userId
  });
  return task;
};
//* Function for list tasks by board
export const listTasksByBoard = async boardId => Task.find({
  board: boardId
}).sort({
  order: 1,
  createdAt: 1
});
//* Function for get task
export const getTask = async taskId => Task.findById(taskId);
//* Function for update task
export const updateTask = async (taskId, patch, userId) => {
  const existingTask = await Task.findById(taskId).select("assignees board title dueDate priority");
  if (!existingTask) return null;
  const allowed = ["title", "description", "assignees", "dueDate", "priority", "completed", "checklist"];
  const update = {};
  for (const k of allowed) if (patch[k] !== undefined) update[k] = patch[k];
  if (update.assignees !== undefined) {
    update.assignees = normalizeAssignees(update.assignees);
  }
  const updatedTask = await Task.findByIdAndUpdate(taskId, update, {
    new: true
  });
  if (updatedTask && update.assignees !== undefined) {
    await notifyNewAssignees({
      task: updatedTask,
      nextAssigneeIds: update.assignees,
      previousAssigneeIds: existingTask.assignees || [],
      assignedByUserId: userId
    });
  }
  return updatedTask;
};
//* Function for delete task
export const deleteTask = async taskId => {
  const task = await Task.findById(taskId);
  if (!task) throw new AppError("Task not found", 404);
  await Task.deleteOne({
    _id: taskId
  });
  return {
    deleted: true,
    taskId: String(task._id),
    boardId: String(task.board)
  };
};
//* Function for move task
export const moveTask = async ({
  taskId,
  toColumnId,
  toOrder
}) => {
  const toColumn = await Column.findById(toColumnId);
  if (!toColumn) throw new AppError("Target column not found", 404);
  const task = await Task.findById(taskId);
  if (!task) throw new AppError("Task not found", 404);
  task.column = toColumnId;
  if (typeof toOrder === "number") task.order = toOrder;
  await task.save();
  return task;
};
//* Function for get my workspace tasks
export const getMyWorkspaceTasks = async ({
  workspaceId,
  userId
}) => {
  const Board = (await import("../models/Board.model.js")).default;
  const boardIds = await Board.find({
    workspace: workspaceId
  }).distinct("_id");
  return Task.find({
    board: {
      $in: boardIds
    },
    assignees: userId
  }).populate("board", "name").populate("column", "name").sort({
    dueDate: 1,
    createdAt: -1
  });
};
//* Function for reorder tasks in column
export const reorderTasksInColumn = async ({
  columnId,
  orderedIds
}) => {
  //* Function for ops
  const ops = orderedIds.map((id, idx) => ({
    updateOne: {
      filter: {
        _id: id,
        column: columnId
      },
      update: {
        order: idx
      }
    }
  }));
  await Task.bulkWrite(ops);
  return {
    reordered: true
  };
};