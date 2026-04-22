import mongoose from "mongoose";
import { SUBSCRIPTION_PLANS } from "../constants/subscriptionPlans.constant.js";
const khaltiPaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    required: true
  },
  pidx: {
    type: String,
    required: true,
    unique: true,
    index: true,
    maxlength: 255
  },
  transactionId: {
    type: String,
    default: null,
    maxlength: 255
  },
  purchaseOrderId: {
    type: String,
    required: true,
    maxlength: 255
  },
  planId: {
    type: String,
    enum: Object.values(SUBSCRIPTION_PLANS),
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: "NPR",
    maxlength: 10
  },
  status: {
    type: String,
    enum: ["initiated", "pending", "completed", "failed", "refunded", "expired", "canceled"],
    default: "initiated"
  },
  fee: {
    type: Number,
    default: 0,
    min: 0
  },
  periodStart: {
    type: Date,
    default: null
  },
  periodEnd: {
    type: Date,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});
khaltiPaymentSchema.index({
  status: 1,
  createdAt: -1
});
export default mongoose.model("KhaltiPayment", khaltiPaymentSchema);