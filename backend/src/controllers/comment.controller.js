import * as commentService from "../services/comment.service.js";
import { HTTP } from "../constants/httpStatus.constant.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for create comment
export const create = asyncHandler(async (req, res) => {
  const io = req.app.get("io");
  const c = await commentService.addComment({
    taskId: req.params.taskId,
    userId: req.user._id,
    text: req.body.text,
    io,
  });
  res.status(HTTP.CREATED).json(c);
});

//* Controller function for list comments
export const list = asyncHandler(async (req, res) => {
  res.json(await commentService.listComments(req.params.taskId));
});

//* Controller function for remove comment
export const remove = asyncHandler(async (req, res) => {
  res.json(
    await commentService.deleteComment(req.params.commentId, req.user._id),
  );
});
