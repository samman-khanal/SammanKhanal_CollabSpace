import User from "../models/User.model.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.util.js";
import cloudinary from "../config/cloudinary.config.js";
import { AppError } from "../utils/AppError.util.js";
//* Function for upload buffer to cloudinary
const uploadBufferToCloudinary = (buffer, options) => new Promise((resolve, reject) => {
  //* Function for stream
  const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
    if (err) reject(err);else resolve(result);
  });
  stream.end(buffer);
});
//* Function for get me
export const getMe = async userId => User.findById(userId).select("-passwordHash");
//* Function for update me
export const updateMe = async (userId, patch) => {
  const allowed = ["fullName", "avatarUrl"];
  const update = {};
  for (const k of allowed) if (patch[k] !== undefined) update[k] = patch[k];
  return User.findByIdAndUpdate(userId, update, {
    new: true
  }).select("-passwordHash");
};
//* Function for update avatar
export const updateAvatar = async (userId, file) => {
  if (!file) throw new AppError("File required", 400);
  const result = await uploadBufferToCloudinary(file.buffer, {
    folder: "collabspace/avatars",
    resource_type: "image",
    use_filename: false,
    unique_filename: true,
    overwrite: false
  });
  return User.findByIdAndUpdate(userId, {
    avatarUrl: result.secure_url
  }, {
    new: true
  }).select("-passwordHash");
};
//* Function for change password
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("passwordHash");
  if (!user) throw new AppError("User not found", 404);
  const isMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!isMatch) throw new AppError("Current password is incorrect", 401);
  await User.updateOne({
    _id: userId
  }, {
    passwordHash: await hashPassword(newPassword),
    passwordChangedAt: new Date()
  });
  return {
    changed: true
  };
};