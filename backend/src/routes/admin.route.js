import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/requireRole.middleware.js";
import { ROLES } from "../constants/roles.constant.js";
import * as adminCtrl from "../controllers/admin.controller.js";
const router = Router();

router.use(auth, requireRole([ROLES.ADMIN]));
router.get("/users", adminCtrl.listUsers);
router.get("/users/:userId", adminCtrl.getUserDetail);
router.patch("/users/:userId/role", adminCtrl.updateUserRole);
router.post("/users/:userId/ban", adminCtrl.banUser);
router.post("/users/:userId/resend-verification", adminCtrl.resendVerification);
router.post(
  "/users/:userId/reset-verification",
  adminCtrl.resetVerificationState,
);
router.get("/subscriptions/overview", adminCtrl.getSubscriptionOverview);
router.get("/payments/stripe", adminCtrl.listPayments);
router.get("/payments/khalti", adminCtrl.listKhaltiPayments);
router.get("/revenue", adminCtrl.getRevenueMetrics);
router.patch("/users/:userId/plan", adminCtrl.overridePlan);
router.get("/contacts", adminCtrl.listContactMessages);
router.patch("/contacts/:messageId/read", adminCtrl.markContactRead);
router.post("/contacts/:messageId/reply", adminCtrl.replyToContact);
router.delete("/contacts/:messageId", adminCtrl.deleteContactMessage);
router.get("/workspaces", adminCtrl.listWorkspaces);
router.get("/workspaces/:workspaceId", adminCtrl.getWorkspaceDetail);
router.delete("/workspaces/:workspaceId", adminCtrl.deleteWorkspace);
router.get("/messages", adminCtrl.listMessages);
router.delete("/messages/:messageId", adminCtrl.deleteMessage);
router.get("/comments", adminCtrl.listComments);
router.delete("/comments/:commentId", adminCtrl.deleteComment);
router.get("/attachments", adminCtrl.listAttachments);
router.get("/channels", adminCtrl.listChannels);
router.delete("/channels/:channelId", adminCtrl.deleteChannel);
router.get("/analytics", adminCtrl.getAnalytics);
router.post("/broadcast", adminCtrl.broadcastNotification);
router.get("/health", adminCtrl.getSystemHealth);

export default router;
