import * as notifService from "../services/notification.service.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for list notifications
export const list = asyncHandler(async (req, res) => {
  res.json(await notifService.listNotifications(req.user._id));
});

//* Controller function for read notification
export const read = asyncHandler(async (req, res) => {
  res.json(await notifService.markRead(req.user._id, req.params.id));
});

//* Controller function for read all notification
export const readAll = asyncHandler(async (req, res) => {
  res.json(await notifService.markAllRead(req.user._id));
});

//* Controller function for remove notification
export const remove = asyncHandler(async (req, res) => {
  res.json(await notifService.deleteNotification(req.user._id, req.params.id));
});

//* Controller function for remove all read notification
export const removeAllRead = asyncHandler(async (req, res) => {
  res.json(await notifService.deleteAllRead(req.user._id));
});
