import * as attachmentService from "../services/attachment.service.js";
import { HTTP } from "../constants/httpStatus.constant.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for upload one
export const uploadOne = asyncHandler(async (req, res) => {
  const a = await attachmentService.uploadAttachment({
    taskId: req.params.taskId,
    userId: req.user._id,
    file: req.file,
  });
  res.status(HTTP.CREATED).json(a);
});

//* Controller function for list
export const list = asyncHandler(async (req, res) => {
  res.json(await attachmentService.listAttachments(req.params.taskId));
});

//* Controller function for remove
export const remove = asyncHandler(async (req, res) => {
  res.json(
    await attachmentService.deleteAttachment(
      req.params.attachmentId,
      req.user._id,
    ),
  );
});
