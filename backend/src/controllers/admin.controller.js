import * as adminService from "../services/admin.service.js";
import { HTTP } from "../constants/httpStatus.constant.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for list users
export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, role, plan, isEmailVerified } = req.query;
  res.json(
    await adminService.listUsers({
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 20, 100),
      search,
      role,
      plan,
      isEmailVerified,
    }),
  );
});

//* Controller function for get user detail
export const getUserDetail = asyncHandler(async (req, res) => {
  res.json(await adminService.getUserDetail(req.params.userId));
});

//* Controller function for update user role
export const updateUserRole = asyncHandler(async (req, res) => {
  res.json(await adminService.updateUserRole(req.params.userId, req.body.role));
});

//* Controller function for ban user
export const banUser = asyncHandler(async (req, res) => {
  res.json(await adminService.banUser(req.params.userId));
});

//* Controller function for resend verification
export const resendVerification = asyncHandler(async (req, res) => {
  res.json(await adminService.resendVerification(req.params.userId));
});

//* Controller function for reset verification state
export const resetVerificationState = asyncHandler(async (req, res) => {
  res.json(await adminService.resetVerificationState(req.params.userId));
});

//* Controller function for get subscription overview
export const getSubscriptionOverview = asyncHandler(async (_req, res) => {
  res.json(await adminService.getSubscriptionOverview());
});

//* Controller function for list payments
export const listPayments = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  res.json(
    await adminService.listPayments({
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 20, 100),
      status,
    }),
  );
});

//* Controller function for list khalti payments
export const listKhaltiPayments = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  res.json(
    await adminService.listKhaltiPayments({
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 20, 100),
      status,
    }),
  );
});

//* Controller function for get revenue metrics
export const getRevenueMetrics = asyncHandler(async (_req, res) => {
  res.json(await adminService.getRevenueMetrics());
});

//* Controller function for override plan
export const overridePlan = asyncHandler(async (req, res) => {
  res.json(await adminService.overridePlan(req.params.userId, req.body.plan));
});

//* Controller function for list contact messages
export const listContactMessages = asyncHandler(async (req, res) => {
  const { page, limit, isRead } = req.query;
  res.json(
    await adminService.listContactMessages({
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 20, 100),
      isRead,
    }),
  );
});

//* Controller function for mark contact read
export const markContactRead = asyncHandler(async (req, res) => {
  res.json(await adminService.markContactRead(req.params.messageId));
});

//* Controller function for reply to contact
export const replyToContact = asyncHandler(async (req, res) => {
  if (!req.body.reply) {
    return res.status(HTTP.BAD_REQUEST).json({
      message: "Reply text is required",
    });
  }
  res.json(
    await adminService.replyToContact(req.params.messageId, req.body.reply),
  );
});

//* Controller function for delete contact message
export const deleteContactMessage = asyncHandler(async (req, res) => {
  res.json(await adminService.deleteContactMessage(req.params.messageId));
});

//* Controller function for list workspaces
export const listWorkspaces = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;
  res.json(
    await adminService.listWorkspaces({
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 20, 100),
      search,
    }),
  );
});

//* Controller function for get workspace detail
export const getWorkspaceDetail = asyncHandler(async (req, res) => {
  res.json(await adminService.getWorkspaceDetail(req.params.workspaceId));
});

//* Controller function for delete workspace
export const deleteWorkspace = asyncHandler(async (req, res) => {
  res.json(await adminService.deleteWorkspace(req.params.workspaceId));
});

//* Controller function for list messages
export const listMessages = asyncHandler(async (req, res) => {
  const { page, limit, channelId } = req.query;
  res.json(
    await adminService.listMessages({
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 20, 100),
      channelId,
    }),
  );
});

//* Controller function for delete message
export const deleteMessage = asyncHandler(async (req, res) => {
  res.json(await adminService.deleteMessage(req.params.messageId));
});
//* Controller function for list comments
export const listComments = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  res.json(
    await adminService.listComments({
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 20, 100),
    }),
  );
});

//* Controller function for delete comment
export const deleteComment = asyncHandler(async (req, res) => {
  res.json(await adminService.deleteComment(req.params.commentId));
});

//* Controller function for list attachments
export const listAttachments = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  res.json(
    await adminService.listAttachments({
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 20, 100),
    }),
  );
});

//* Controller function for list channels
export const listChannels = asyncHandler(async (req, res) => {
  const { page, limit, workspaceId } = req.query;
  res.json(
    await adminService.listChannels({
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 20, 100),
      workspaceId,
    }),
  );
});

//* Controller function for delete channel
export const deleteChannel = asyncHandler(async (req, res) => {
  res.json(await adminService.deleteChannel(req.params.channelId));
});

//* Controller function for get analytics
export const getAnalytics = asyncHandler(async (_req, res) => {
  res.json(await adminService.getAnalytics());
});

//* Controller function for broadcast notification
export const broadcastNotification = asyncHandler(async (req, res) => {
  if (!req.body.message) {
    return res.status(HTTP.BAD_REQUEST).json({
      message: "Message is required",
    });
  }
  const io = req.app.get("io");
  res.json(
    await adminService.broadcastNotification({
      message: req.body.message,
      meta: req.body.meta || {},
      io,
    }),
  );
});

//* Controller function for get system health
export const getSystemHealth = asyncHandler(async (_req, res) => {
  res.json(await adminService.getSystemHealth());
});
