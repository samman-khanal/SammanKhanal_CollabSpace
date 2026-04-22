import crypto from "crypto";
import { PLAN_LIMITS, SUBSCRIPTION_PLANS } from "../constants/subscriptionPlans.constant.js";
const KHALTI_BASE_URL = process.env.KHALTI_API_URL || (process.env.KHALTI_ENV === "production" ? "https://khalti.com/api/v2" : "https://a.khalti.com/api/v2");
//* Function for khalti request
const khaltiRequest = async (endpoint, method = "POST", body = null) => {
  const headers = {
    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
    "Content-Type": "application/json"
  };
  const options = {
    method,
    headers
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  try {
    const response = await fetch(`${KHALTI_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    if (!response.ok) {
      const errorMessage = data.detail || data.error_key || data.message || "Khalti API error";
      console.error(`Khalti API Error [${response.status}]:`, errorMessage, data);
      throw new Error(errorMessage);
    }
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Khalti API network error:', error);
      throw new Error('Unable to connect to Khalti payment service. Please try again.');
    }
    throw error;
  }
};
//* Function for initiate payment
export const initiatePayment = async ({
  amount,
  purchaseOrderId,
  purchaseOrderName,
  returnUrl,
  websiteUrl,
  customerInfo
}) => {
  const amountInPaisa = Math.round(amount * 100);
  const payload = {
    return_url: returnUrl,
    website_url: websiteUrl,
    amount: amountInPaisa,
    purchase_order_id: purchaseOrderId,
    purchase_order_name: purchaseOrderName,
    customer_info: {
      name: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone || ""
    }
  };
  const response = await khaltiRequest("/epayment/initiate/", "POST", payload);
  return {
    pidx: response.pidx,
    paymentUrl: response.payment_url,
    expiresAt: response.expires_at,
    expiresIn: response.expires_in
  };
};
//* Function for verify payment
export const verifyPayment = async pidx => {
  const response = await khaltiRequest("/epayment/lookup/", "POST", {
    pidx
  });
  return {
    pidx: response.pidx,
    totalAmount: response.total_amount / 100,
    status: response.status,
    transactionId: response.transaction_id,
    fee: response.fee ? response.fee / 100 : 0,
    refunded: response.refunded
  };
};
//* Function for get plan price npr
export const getPlanPriceNPR = planId => {
  const USD_TO_NPR_RATE = 133;
  const planLimits = PLAN_LIMITS[planId];
  if (!planLimits || planLimits.price === 0) {
    return 0;
  }
  const priceInUSD = planLimits.price / 100;
  const priceInNPR = Math.round(priceInUSD * USD_TO_NPR_RATE);
  return priceInNPR;
};
//* Function for generate order id
export const generateOrderId = (userId, planId) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString("hex");
  return `POOKIE-${userId.toString().slice(-6)}-${planId.toUpperCase()}-${timestamp}-${random}`;
};
//* Function for get plan duration
export const getPlanDuration = planId => {
  return 1;
};
//* Function for validate webhook signature
export const validateWebhookSignature = (payload, signature) => {
  const webhookSecret = process.env.KHALTI_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("KHALTI_WEBHOOK_SECRET not configured");
    return false;
  }
  const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(JSON.stringify(payload)).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
};
export default {
  initiatePayment,
  verifyPayment,
  getPlanPriceNPR,
  generateOrderId,
  getPlanDuration,
  validateWebhookSignature
};