import { Router } from "express";
import express from "express";
import * as subscriptionController from "../controllers/subscription.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const router = Router();

router.get("/plans", subscriptionController.getPlans);
router.post(
  "/webhook",
  express.raw({
    type: "application/json",
  }),
  subscriptionController.handleWebhook,
);
router.use(authMiddleware);
router.get("/me", subscriptionController.getMySubscription);
router.post("/checkout", subscriptionController.createCheckoutSession);
router.post("/billing-portal", subscriptionController.createBillingPortal);
router.post("/cancel", subscriptionController.cancelSubscription);
router.post("/resume", subscriptionController.resumeSubscription);
router.get("/payments", subscriptionController.getPaymentHistory);
router.get("/limits/workspace", subscriptionController.checkWorkspaceLimit);
router.get("/limits/board", subscriptionController.checkBoardLimit);

export default router;
