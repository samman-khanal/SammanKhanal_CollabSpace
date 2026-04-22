import Comment from "../models/Comment.model.js";
import Task from "../models/Task.model.js";
import User from "../models/User.model.js";
import Board from "../models/Board.model.js";
import Workspace from "../models/Workspace.model.js";
import { sendEmail } from "../utils/sendEmail.util.js";
import { taskCommentedTemplate } from "../utils/email/taskCommented.emai.js";
import { createNotification } from "./notification.service.js";
import { AppError } from "../utils/AppError.util.js";
import { toIdString, buildTaskUrl } from "../utils/validators.util.js";
//* Function for notify task comment recipients
const notifyTaskCommentRecipients = async ({
  task,
  commenter,
  comment,
  io
}) => {
  const recipientIds = new Set([...(task.assignees || []).map(toIdString), toIdString(task.createdBy)]);
  recipientIds.delete(toIdString(commenter._id));
  if (!recipientIds.size) return;
  const [board, recipients] = await Promise.all([Board.findById(task.board).select("name workspace").lean(), User.find({
    _id: {
      $in: [...recipientIds]
    }
  }).select("fullName email").lean()]);
  if (!recipients.length) return;
  const workspace = board?.workspace ? await Workspace.findById(board.workspace).select("name").lean() : null;
  const workspaceName = workspace?.name || "your workspace";
  const boardName = board?.name || "your board";
  const taskUrl = buildTaskUrl(task.board);
  //* Function for notify task comment recipients
  await Promise.allSettled([...recipients.filter(r => Boolean(r.email)).map(recipient => sendEmail({
    to: recipient.email,
    subject: `New comment on task: ${task.title}`,
    html: taskCommentedTemplate({
      recipientName: recipient.fullName,
      commenterName: commenter.fullName,
      taskTitle: task.title,
      commentText: comment.text,
      workspaceName,
      boardName,
      taskUrl
    })
  })), ...recipients.map(recipient => createNotification({
    userId: recipient._id,
    type: "task_comment",
    message: `${commenter.fullName} commented on task \"${task.title}\"`,
    meta: {
      taskId: task._id,
      boardId: task.board,
      commentId: comment._id,
      commenterName: commenter.fullName,
      preview: (comment.text || "").slice(0, 120)
    },
    io
  }))]);
};
//* Function for add comment
export const addComment = async ({
  taskId,
  userId,
  text,
  io
}) => {
  const [task, commenter] = await Promise.all([Task.findById(taskId).select("title board assignees createdBy").lean(), User.findById(userId).select("fullName").lean()]);
  if (!task) throw new AppError("Task not found", 404);
  if (!commenter) throw new AppError("User not found", 404);
  const comment = await Comment.create({
    task: taskId,
    author: userId,
    text
  });
  await notifyTaskCommentRecipients({
    task,
    commenter,
    comment,
    io
  });
  return comment;
};
//* Function for list comments
export const listComments = async taskId => Comment.find({
  task: taskId
}).populate("author", "fullName email avatarUrl").sort({
  createdAt: 1
});
//* Function for delete comment
export const deleteComment = async (commentId, userId) => {
  const c = await Comment.findById(commentId);
  if (!c) throw new AppError("Comment not found", 404);
  if (String(c.author) !== String(userId)) throw new AppError("Forbidden", 403);
  await Comment.deleteOne({
    _id: commentId
  });
  return {
    deleted: true
  };
};