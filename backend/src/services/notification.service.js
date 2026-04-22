import Notification from "../models/Notification.model.js";
import { APP_EVENTS } from "../constants/appEvents.constant.js";
//* Function for create notification
export const createNotification = async ({
  userId,
  type,
  message,
  meta = {},
  io
}) => {
  const notif = await Notification.create({
    user: userId,
    type,
    message,
    meta,
    deliveredAt: new Date()
  });
  if (io) {
    io.to(`user:${String(userId)}`).emit(APP_EVENTS.NOTIFICATION_NEW, notif);
  }
  return notif;
};
//* Function for notify workspace members
export const notifyWorkspaceMembers = async ({
  memberUserIds,
  excludeUserId,
  type,
  message,
  meta = {},
  io
}) => {
  //* Function for targets
  const targets = memberUserIds.map(id => String(id)).filter(id => id !== String(excludeUserId));
  if (!targets.length) return [];
  //* Function for notify workspace members
  return Promise.all(targets.map(uid => createNotification({
    userId: uid,
    type,
    message,
    meta,
    io
  })));
};
//* Function for list notifications
export const listNotifications = async userId => Notification.find({
  user: userId
}).sort({
  createdAt: -1
}).limit(200);
//* Function for mark read
export const markRead = async (userId, id) => {
  await Notification.updateOne({
    _id: id,
    user: userId
  }, {
    readAt: new Date()
  });
  return {
    read: true
  };
};
//* Function for mark all read
export const markAllRead = async userId => {
  await Notification.updateMany({
    user: userId,
    readAt: null
  }, {
    readAt: new Date()
  });
  return {
    readAll: true
  };
};
//* Function for delete notification
export const deleteNotification = async (userId, id) => {
  await Notification.deleteOne({
    _id: id,
    user: userId
  });
  return {
    deleted: true
  };
};
//* Function for delete all read
export const deleteAllRead = async userId => {
  const result = await Notification.deleteMany({
    user: userId,
    readAt: {
      $ne: null
    }
  });
  return {
    deleted: result.deletedCount
  };
};