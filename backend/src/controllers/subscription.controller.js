import * as subscriptionService from "../services/subscription.service.js";
import * as stripeService from "../services/stripe.service.js";
import { HTTP } from "../constants/httpStatus.constant.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for get my subscription
export const getMySubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.getUserSubscription(
    req.user._id,
  );
  const limits = await subscriptionService.getUserPlanLimits(req.user._id);
  res.json({
    subscription,
    limits,
  });
});

//* Controller function for get plans
export const getPlans = asyncHandler(async (req, res) => {
  const plans = subscriptionService.getPlansInfo();
  res.json(plans);
});

//* Controller function for create checkout session
export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { planId, successUrl, cancelUrl } = req.body;
  if (!planId || !successUrl || !cancelUrl) {
    return res.status(HTTP.BAD_REQUEST).json({
      error: "planId, successUrl and cancelUrl are required",
    });
  }
  const session = await subscriptionService.createUpgradeCheckoutSession(
    req.user._id,
    {
      planId,
      successUrl,
      cancelUrl,
    },
  );
  res.json({
    sessionId: session.id,
    url: session.url,
  });
});

//* Controller function for create billing portal
export const createBillingPortal = asyncHandler(async (req, res) => {
  const { returnUrl } = req.body;
  if (!returnUrl) {
    return res.status(HTTP.BAD_REQUEST).json({
      error: "returnUrl is required",
    });
  }
  const session = await subscriptionService.createBillingPortalSession(
    req.user._id,
    returnUrl,
  );
  res.json({
    url: session.url,
  });
});

//* Controller function for cancel subscription
export const cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.cancelSubscription(
    req.user._id,
  );
  res.json({
    message: "Subscription will be canceled at the end of the billing period",
    subscription,
  });
});

//* Controller function for resume subscription
export const resumeSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.resumeSubscription(
    req.user._id,
  );
  res.json({
    message: "Subscription resumed successfully",
    subscription,
  });
});

//* Controller function for get payment history
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await subscriptionService.getPaymentHistory(req.user._id);
  res.json(payments);
});

//* Controller function for check workspace limit
export const checkWorkspaceLimit = asyncHandler(async (req, res) => {
  const result = await subscriptionService.canCreateWorkspace(req.user._id);
  res.json(result);
});

//* Controller function for check board limit
export const checkBoardLimit = asyncHandler(async (req, res) => {
  const result = await subscriptionService.canCreateBoard(req.user._id);
  res.json(result);
});

//* Controller function for handle webhook
export const handleWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripeService.constructWebhookEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(HTTP.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
  }
  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await subscriptionService.handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await subscriptionService.handleSubscriptionDeleted(event.data.object);
        break;
      case "invoice.payment_succeeded":
        await subscriptionService.handlePaymentSucceeded(event.data.object);
        break;
      case "invoice.payment_failed":
        console.log("Payment failed for invoice:", event.data.object.id);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    res.json({
      received: true,
    });
  } catch (err) {
    console.error("Error handling webhook:", err);
    next(err);
  }
};
