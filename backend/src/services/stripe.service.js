import Stripe from "stripe";
import { PLAN_LIMITS, SUBSCRIPTION_PLANS } from "../constants/subscriptionPlans.constant.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
//* Function for create customer
export const createCustomer = async ({
  email,
  name,
  userId
}) => {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId
    }
  });
  return customer;
};
//* Function for get customer
export const getCustomer = async customerId => {
  return stripe.customers.retrieve(customerId);
};
//* Function for create checkout session
export const createCheckoutSession = async ({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  userId
}) => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{
      price: priceId,
      quantity: 1
    }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId
    }
  });
  return session;
};
//* Function for create billing portal session
export const createBillingPortalSession = async ({
  customerId,
  returnUrl
}) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  });
  return session;
};
//* Function for get subscription
export const getSubscription = async subscriptionId => {
  return stripe.subscriptions.retrieve(subscriptionId);
};
//* Function for cancel subscription
export const cancelSubscription = async subscriptionId => {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  });
};
//* Function for resume subscription
export const resumeSubscription = async subscriptionId => {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false
  });
};
//* Function for construct webhook event
export const constructWebhookEvent = (payload, signature, webhookSecret) => {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
};
//* Function for create pro plan price
export const createProPlanPrice = async () => {
  const product = await stripe.products.create({
    name: PLAN_LIMITS[SUBSCRIPTION_PLANS.PRO].name,
    description: PLAN_LIMITS[SUBSCRIPTION_PLANS.PRO].description
  });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: PLAN_LIMITS[SUBSCRIPTION_PLANS.PRO].price,
    currency: "usd",
    recurring: {
      interval: "month"
    }
  });
  return {
    product,
    price
  };
};
//* Function for get prices
export const getPrices = async () => {
  const prices = await stripe.prices.list({
    active: true,
    expand: ["data.product"]
  });
  return prices.data;
};
//* Function for get payment intent
export const getPaymentIntent = async paymentIntentId => {
  return stripe.paymentIntents.retrieve(paymentIntentId);
};
//* Function for list invoices
export const listInvoices = async customerId => {
  return stripe.invoices.list({
    customer: customerId,
    limit: 10
  });
};
//* Function for list subscriptions
export const listSubscriptions = async customerId => {
  return stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 20
  });
};
export default {
  createCustomer,
  getCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  getSubscription,
  cancelSubscription,
  resumeSubscription,
  constructWebhookEvent,
  createProPlanPrice,
  getPrices,
  getPaymentIntent,
  listInvoices,
  listSubscriptions
};