import * as khaltiService from "../services/khalti.service.js";
import * as subscriptionService from "../services/subscription.service.js";
import KhaltiPayment from "../models/KhaltiPayment.model.js";
import Subscription from "../models/Subscription.model.js";
import User from "../models/User.model.js";
import { HTTP } from "../constants/httpStatus.constant.js";
import {
  SUBSCRIPTION_PLANS,
  PLAN_LIMITS,
} from "../constants/subscriptionPlans.constant.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for initiate khalti payment
export const initiateKhaltiPayment = asyncHandler(async (req, res) => {
  const { planId, returnUrl, websiteUrl } = req.body;
  const userId = req.user._id;
  if (!planId || planId === SUBSCRIPTION_PLANS.FREE) {
    return res.status(HTTP.BAD_REQUEST).json({
      error: "Invalid plan selected",
    });
  }
  if (planId !== SUBSCRIPTION_PLANS.PLUS && planId !== SUBSCRIPTION_PLANS.PRO) {
    return res.status(HTTP.BAD_REQUEST).json({
      error: "Unsupported plan selected",
    });
  }
  if (!returnUrl || !websiteUrl) {
    return res.status(HTTP.BAD_REQUEST).json({
      error: "returnUrl and websiteUrl are required",
    });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(HTTP.NOT_FOUND).json({
      error: "User not found",
    });
  }
  const subscription = await subscriptionService.getUserSubscription(userId);
  const amountNPR = khaltiService.getPlanPriceNPR(planId);
  if (amountNPR <= 0) {
    return res.status(HTTP.BAD_REQUEST).json({
      error: "Invalid plan price",
    });
  }
  const purchaseOrderId = khaltiService.generateOrderId(userId, planId);
  const planName = PLAN_LIMITS[planId].name;
  const paymentResponse = await khaltiService.initiatePayment({
    amount: amountNPR,
    purchaseOrderId,
    purchaseOrderName: `${planName} Plan - Monthly`,
    returnUrl,
    websiteUrl,
    customerInfo: {
      name: user.fullName,
      email: user.email,
      phone: user.phone || "",
    },
  });
  await KhaltiPayment.create({
    user: userId,
    subscription: subscription._id,
    pidx: paymentResponse.pidx,
    purchaseOrderId,
    planId,
    amount: amountNPR,
    status: "initiated",
    metadata: {
      expiresAt: paymentResponse.expiresAt,
    },
  });
  res.json({
    pidx: paymentResponse.pidx,
    paymentUrl: paymentResponse.paymentUrl,
    expiresAt: paymentResponse.expiresAt,
    amount: amountNPR,
    currency: "NPR",
  });
});

//* Controller function for verify khalti payment
export const verifyKhaltiPayment = asyncHandler(async (req, res) => {
  const { pidx } = req.body;
  if (!pidx) {
    return res.status(HTTP.BAD_REQUEST).json({
      error: "pidx is required",
    });
  }
  const khaltiPayment = await KhaltiPayment.findOne({
    pidx,
  });
  if (!khaltiPayment) {
    return res.status(HTTP.NOT_FOUND).json({
      error: "Payment record not found",
    });
  }
  const verification = await khaltiService.verifyPayment(pidx);
  khaltiPayment.transactionId = verification.transactionId;
  khaltiPayment.fee = verification.fee;
  if (verification.status === "Completed") {
    khaltiPayment.status = "completed";
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    khaltiPayment.periodStart = now;
    khaltiPayment.periodEnd = periodEnd;
    const subscription = await Subscription.findById(
      khaltiPayment.subscription,
    );
    if (subscription) {
      subscription.plan = khaltiPayment.planId;
      subscription.status = "active";
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;
      subscription.cancelAtPeriodEnd = false;
      await subscription.save();
    }
    await khaltiPayment.save();
    return res.json({
      success: true,
      message: "Payment verified and subscription activated",
      payment: {
        transactionId: verification.transactionId,
        amount: verification.totalAmount,
        status: "completed",
        plan: khaltiPayment.planId,
        periodStart: now,
        periodEnd,
      },
    });
  }
  const statusMap = {
    Pending: "pending",
    Initiated: "pending",
    Refunded: "refunded",
    Expired: "expired",
    "User canceled": "canceled",
  };
  khaltiPayment.status = statusMap[verification.status] || "failed";
  await khaltiPayment.save();
  const messageMap = {
    pending: "Payment is still pending",
    refunded: "Payment was refunded",
    expired: "Payment has expired",
    canceled: "Payment was canceled by user",
    failed: "Payment failed",
  };
  res.json({
    success: false,
    message: messageMap[khaltiPayment.status],
    status: khaltiPayment.status,
  });
});

//* Controller function for get khalti payment history
export const getKhaltiPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await KhaltiPayment.find({
    user: req.user._id,
  })
    .sort({
      createdAt: -1,
    })
    .limit(20);
  res.json(payments);
});

//* Controller function for handle khalti callback
export const handleKhaltiCallback = asyncHandler(async (req, res) => {
  const { pidx, transaction_id } = req.query;
  if (!pidx) {
    return res.status(HTTP.BAD_REQUEST).json({
      error: "pidx is required",
    });
  }
  const khaltiPayment = await KhaltiPayment.findOne({
    pidx,
  });
  if (!khaltiPayment) {
    return res.status(HTTP.NOT_FOUND).json({
      error: "Payment record not found",
    });
  }
  const verification = await khaltiService.verifyPayment(pidx);
  khaltiPayment.transactionId = verification.transactionId || transaction_id;
  khaltiPayment.fee = verification.fee || 0;
  if (verification.status === "Completed") {
    khaltiPayment.status = "completed";
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    khaltiPayment.periodStart = now;
    khaltiPayment.periodEnd = periodEnd;
    const subscription = await Subscription.findById(
      khaltiPayment.subscription,
    );
    if (subscription) {
      subscription.plan = khaltiPayment.planId;
      subscription.status = "active";
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;
      subscription.cancelAtPeriodEnd = false;
      await subscription.save();
    }
  } else if (verification.status === "User canceled") {
    khaltiPayment.status = "canceled";
  } else if (verification.status === "Expired") {
    khaltiPayment.status = "expired";
  } else if (verification.status === "Refunded") {
    khaltiPayment.status = "refunded";
  } else {
    khaltiPayment.status = verification.status?.toLowerCase() || "pending";
  }
  await khaltiPayment.save();
  res.json({
    success: verification.status === "Completed",
    status: khaltiPayment.status,
    transactionId: khaltiPayment.transactionId,
    planId: khaltiPayment.planId,
  });
});

//* Controller function for get khalti prices
export const getKhaltiPrices = asyncHandler(async (req, res) => {
  const prices = {
    [SUBSCRIPTION_PLANS.FREE]: {
      id: SUBSCRIPTION_PLANS.FREE,
      name: PLAN_LIMITS[SUBSCRIPTION_PLANS.FREE].name,
      priceNPR: 0,
      priceUSD: 0,
    },
    [SUBSCRIPTION_PLANS.PLUS]: {
      id: SUBSCRIPTION_PLANS.PLUS,
      name: PLAN_LIMITS[SUBSCRIPTION_PLANS.PLUS].name,
      priceNPR: khaltiService.getPlanPriceNPR(SUBSCRIPTION_PLANS.PLUS),
      priceUSD: PLAN_LIMITS[SUBSCRIPTION_PLANS.PLUS].price / 100,
    },
    [SUBSCRIPTION_PLANS.PRO]: {
      id: SUBSCRIPTION_PLANS.PRO,
      name: PLAN_LIMITS[SUBSCRIPTION_PLANS.PRO].name,
      priceNPR: khaltiService.getPlanPriceNPR(SUBSCRIPTION_PLANS.PRO),
      priceUSD: PLAN_LIMITS[SUBSCRIPTION_PLANS.PRO].price / 100,
    },
  };
  res.json(prices);
});
