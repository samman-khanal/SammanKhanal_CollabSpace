import Attachment from "../models/Attachment.model.js";
import cloudinary from "../config/cloudinary.config.js";
import { AppError } from "../utils/AppError.util.js";
//* Function for upload buffer to cloudinary
const uploadBufferToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    //* Function for stream
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    stream.end(buffer);
  });
//* Function for resource type
const resourceType = (mimeType) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "raw";
};
//* Function for upload attachment
export const uploadAttachment = async ({ taskId, userId, file }) => {
  if (!file) throw new AppError("File required", 400);
  const result = await uploadBufferToCloudinary(file.buffer, {
    folder: "collabspace/attachments",
    resource_type: resourceType(file.mimetype),
    use_filename: true,
    unique_filename: true,
  });
  return Attachment.create({
    task: taskId,
    uploadedBy: userId,
    fileName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    url: result.secure_url,
    publicId: result.public_id,
  });
};
//* Function for list attachments
export const listAttachments = async (taskId) =>
  Attachment.find({
    task: taskId,
  }).sort({
    createdAt: -1,
  });
//* Function for delete attachment
export const deleteAttachment = async (attachmentId, userId) => {
  const a = await Attachment.findById(attachmentId);
  if (!a) throw new AppError("Attachment not found", 404);
  if (String(a.uploadedBy) !== String(userId))
    throw new AppError("Forbidden", 403);
  await cloudinary.uploader.destroy(a.publicId, {
    resource_type: resourceType(a.mimeType),
  });
  await Attachment.deleteOne({
    _id: attachmentId,
  });
  return {
    deleted: true,
  };
};
