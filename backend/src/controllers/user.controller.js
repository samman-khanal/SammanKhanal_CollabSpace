import * as userService from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for me
export const me = asyncHandler(async (req, res) => {
  res.json(await userService.getMe(req.user._id));
});

//* Controller function for update me
export const updateMe = asyncHandler(async (req, res) => {
  res.json(await userService.updateMe(req.user._id, req.body));
});

//* Controller function for upload avatar
export const uploadAvatar = asyncHandler(async (req, res) => {
  res.json(await userService.updateAvatar(req.user._id, req.file));
});

//* Controller function for change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: "currentPassword and newPassword are required",
    });
  }
  res.json(
    await userService.changePassword(
      req.user._id,
      currentPassword,
      newPassword,
    ),
  );
});
