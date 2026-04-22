import Subscription from "../models/Subscription.model.js";
import Payment from "../models/Payment.model.js";
import Workspace from "../models/Workspace.model.js";
import Board from "../models/Board.model.js";
import User from "../models/User.model.js";
import * as stripeService from "./stripe.service.js";
import { SUBSCRIPTION_PLANS, PLAN_LIMITS } from "../constants/subscriptionPlans.constant.js";
import { AppError } from "../utils/AppError.util.js";
//* Function for get period start end
const getPeriodStartEnd = stripeSubscription => {
  const item = stripeSubscription?.items?.data?.[0];
  const startUnix = stripeSubscription?.current_period_start ?? item?.current_period_start ?? null;
  const endUnix = stripeSubscription?.current_period_end ?? item?.current_period_end ?? null;
  return {
    currentPeriodStart: startUnix ? new Date(startUnix * 1000) : null,
    currentPeriodEnd: endUnix ? new Date(endUnix * 1000) : null
  };
};
//* Function for resolve plan from stripe subscription
const resolvePlanFromStripeSubscription = stripeSubscription => {
  const plusPriceId = process.env.STRIPE_PLUS_PRICE_ID;
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
  const priceId = stripeSubscription?.items?.data?.[0]?.price?.id || stripeSubscription?.plan?.id || null;
  if (priceId && proPriceId && priceId === proPriceId) {
    return SUBSCRIPTION_PLANS.PRO;
  }
  if (priceId && plusPriceId && priceId === plusPriceId) {
    return SUBSCRIPTION_PLANS.PLUS;
  }
  return null;
};
//* Function for reconcile from stripe if needed
const reconcileFromStripeIfNeeded = async subscription => {
  if (!subscription?.stripeCustomerId) return subscription;
  const needsReconcile = !subscription.stripeSubscriptionId || subscription.plan === SUBSCRIPTION_PLANS.FREE;
  if (!needsReconcile) return subscription;
  const list = await stripeService.listSubscriptions(subscription.stripeCustomerId);
  const stripeSubs = list?.data || [];
  const prioritized = ["active", "trialing", "past_due", "incomplete"];
  //* Function for stripe subscription
  const stripeSubscription = stripeSubs.find(s => prioritized.includes(s.status)) || stripeSubs[0] || null;
  if (!stripeSubscription) return subscription;
  const {
    currentPeriodStart,
    currentPeriodEnd
  } = getPeriodStartEnd(stripeSubscription);
  subscription.stripeSubscriptionId = stripeSubscription.id;
  subscription.status = stripeSubscription.status;
  subscription.currentPeriodStart = currentPeriodStart;
  subscription.currentPeriodEnd = currentPeriodEnd;
  subscription.cancelAtPeriodEnd = !!stripeSubscription.cancel_at_period_end;
  const resolvedPlan = resolvePlanFromStripeSubscription(stripeSubscription);
  if (resolvedPlan) {
    subscription.plan = resolvedPlan;
  }
  await subscription.save();
  const invoices = await stripeService.listInvoices(subscription.stripeCustomerId);
  for (const invoice of invoices?.data || []) {
    if (invoice?.status !== "paid") continue;
    if (!invoice?.payment_intent) continue;
    const existing = await Payment.findOne({
      stripePaymentIntentId: String(invoice.payment_intent)
    });
    if (existing) continue;
    await Payment.create({
      user: subscription.user,
      subscription: subscription._id,
      stripePaymentIntentId: String(invoice.payment_intent),
      stripeInvoiceId: invoice.id || null,
      amount: invoice.amount_paid || 0,
      currency: invoice.currency || "usd",
      status: "succeeded",
      receiptUrl: invoice.hosted_invoice_url || null,
      description: invoice.description || "Stripe subscription payment"
    });
  }
  return subscription;
};
//* Function for create free subscription
export const createFreeSubscription = async userId => {
  const subscription = await Subscription.create({
    user: userId,
    plan: SUBSCRIPTION_PLANS.FREE,
    status: "active"
  });
  return subscription;
};
//* Function for get user subscription
export const getUserSubscription = async userId => {
  let subscription = await Subscription.findOne({
    user: userId
  });
  if (!subscription) subscription = await createFreeSubscription(userId);
  subscription = await reconcileFromStripeIfNeeded(subscription);
  return subscription;
};
//* Function for get user plan limits
export const getUserPlanLimits = async userId => {
  const subscription = await getUserSubscription(userId);
  return PLAN_LIMITS[subscription.plan];
};
//* Function for can create workspace
export const canCreateWorkspace = async userId => {
  const subscription = await getUserSubscription(userId);
  const limits = PLAN_LIMITS[subscription.plan];
  if (limits.maxWorkspaces === Infinity) {
    return {
      allowed: true
    };
  }
  const workspaceCount = await Workspace.countDocuments({
    owner: userId
  });
  if (workspaceCount >= limits.maxWorkspaces) {
    return {
      allowed: false,
      reason: `You have reached the maximum number of workspaces (${limits.maxWorkspaces}) for the ${limits.name} plan. Please upgrade to Pro for unlimited workspaces.`,
      currentCount: workspaceCount,
      limit: limits.maxWorkspaces
    };
  }
  return {
    allowed: true,
    currentCount: workspaceCount,
    limit: limits.maxWorkspaces
  };
};
//* Function for can create board
export const canCreateBoard = async userId => {
  const subscription = await getUserSubscription(userId);
  const limits = PLAN_LIMITS[subscription.plan];
  if (limits.maxBoards === Infinity) {
    return {
      allowed: true
    };
  }
  const boardCount = await Board.countDocuments({
    createdBy: userId
  });
  if (boardCount >= limits.maxBoards) {
    return {
      allowed: false,
      reason: `You have reached the maximum number of boards (${limits.maxBoards}) for the ${limits.name} plan. Please upgrade to Pro for unlimited boards.`,
      currentCount: boardCount,
      limit: limits.maxBoards
    };
  }
  return {
    allowed: true,
    currentCount: boardCount,
    limit: limits.maxBoards
  };
};
//* Function for create upgrade checkout session
export const createUpgradeCheckoutSession = async (userId, {
  planId,
  successUrl,
  cancelUrl
}) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  if (!planId || planId === SUBSCRIPTION_PLANS.FREE) {
    throw new AppError("Invalid plan selected", 400);
  }
  if (planId !== SUBSCRIPTION_PLANS.PLUS && planId !== SUBSCRIPTION_PLANS.PRO) {
    throw new AppError("Unsupported plan selected", 400);
  }
  let subscription = await getUserSubscription(userId);
  if (!subscription.stripeCustomerId) {
    const customer = await stripeService.createCustomer({
      email: user.email,
      name: user.fullName,
      userId: userId.toString()
    });
    subscription.stripeCustomerId = customer.id;
    await subscription.save();
  }
  const priceId = planId === SUBSCRIPTION_PLANS.PRO ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_PLUS_PRICE_ID;
  if (!priceId) {
    throw new AppError(planId === SUBSCRIPTION_PLANS.PRO ? "Stripe Pro price ID not configured" : "Stripe Plus price ID not configured", 500);
  }
  const session = await stripeService.createCheckoutSession({
    customerId: subscription.stripeCustomerId,
    priceId,
    successUrl,
    cancelUrl,
    userId: userId.toString()
  });
  return session;
};
//* Function for create billing portal session
export const createBillingPortalSession = async (userId, returnUrl) => {
  const subscription = await getUserSubscription(userId);
  if (!subscription.stripeCustomerId) {
    throw new AppError("No billing information found", 400);
  }
  const session = await stripeService.createBillingPortalSession({
    customerId: subscription.stripeCustomerId,
    returnUrl
  });
  return session;
};
//* Function for handle subscription updated
export const handleSubscriptionUpdated = async stripeSubscription => {
  const subscription = await Subscription.findOne({
    stripeCustomerId: stripeSubscription.customer
  });
  if (!subscription) {
    console.error("No subscription found for customer:", stripeSubscription.customer);
    return;
  }
  subscription.stripeSubscriptionId = stripeSubscription.id;
  subscription.status = stripeSubscription.status;
  const {
    currentPeriodStart,
    currentPeriodEnd
  } = getPeriodStartEnd(stripeSubscription);
  subscription.currentPeriodStart = currentPeriodStart;
  subscription.currentPeriodEnd = currentPeriodEnd;
  subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
  if (stripeSubscription.status === "active" || stripeSubscription.status === "trialing") {
    const resolvedPlan = resolvePlanFromStripeSubscription(stripeSubscription);
    if (resolvedPlan) subscription.plan = resolvedPlan;
  }
  await subscription.save();
  return subscription;
};
//* Function for handle subscription deleted
export const handleSubscriptionDeleted = async stripeSubscription => {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id
  });
  if (!subscription) {
    console.error("No subscription found for:", stripeSubscription.id);
    return;
  }
  subscription.plan = SUBSCRIPTION_PLANS.FREE;
  subscription.status = "canceled";
  subscription.stripeSubscriptionId = null;
  subscription.currentPeriodStart = null;
  subscription.currentPeriodEnd = null;
  subscription.cancelAtPeriodEnd = false;
  await subscription.save();
  return subscription;
};
//* Function for handle payment succeeded
export const handlePaymentSucceeded = async invoice => {
  const subscription = await Subscription.findOne({
    stripeCustomerId: invoice.customer
  });
  if (!subscription) {
    console.error("No subscription found for customer:", invoice.customer);
    return;
  }
  await Payment.create({
    user: subscription.user,
    subscription: subscription._id,
    stripePaymentIntentId: invoice.payment_intent,
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: "succeeded",
    receiptUrl: invoice.hosted_invoice_url,
    description: `Pro Plan - ${new Date(invoice.period_start * 1000).toLocaleDateString()} to ${new Date(invoice.period_end * 1000).toLocaleDateString()}`
  });
};
//* Function for cancel subscription
export const cancelSubscription = async userId => {
  const subscription = await getUserSubscription(userId);
  if (subscription.plan === "free" || subscription.status !== "active") {
    throw new AppError("No active subscription to cancel", 400);
  }
  if (subscription.stripeSubscriptionId) {
    await stripeService.cancelSubscription(subscription.stripeSubscriptionId);
  }
  subscription.cancelAtPeriodEnd = true;
  await subscription.save();
  return subscription;
};
//* Function for resume subscription
export const resumeSubscription = async userId => {
  const subscription = await getUserSubscription(userId);
  if (!subscription.cancelAtPeriodEnd) {
    throw new Error("No subscription to resume");
  }
  if (subscription.stripeSubscriptionId) {
    await stripeService.resumeSubscription(subscription.stripeSubscriptionId);
  }
  subscription.cancelAtPeriodEnd = false;
  await subscription.save();
  return subscription;
};
//* Function for get payment history
export const getPaymentHistory = async userId => {
  return Payment.find({
    user: userId
  }).sort({
    createdAt: -1
  }).limit(20);
};
//* Function for get plans info
export const getPlansInfo = () => {
  //* Function for get plans info
  return Object.entries(PLAN_LIMITS).map(([key, value]) => ({
    id: key,
    ...value,
    maxWorkspaces: value.maxWorkspaces === Infinity ? "Unlimited" : value.maxWorkspaces,
    maxBoards: value.maxBoards === Infinity ? "Unlimited" : value.maxBoards,
    messageRetention: value.messageRetentionDays === Infinity ? "Forever" : `${value.messageRetentionDays} days`
  }));
};