import mongoose from "mongoose";
import { SUBSCRIPTION_PLANS } from "../constants/subscriptionPlans.constant.js";
const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true
  },
  plan: {
    type: String,
    enum: Object.values(SUBSCRIPTION_PLANS),
    default: SUBSCRIPTION_PLANS.FREE
  },
  stripeCustomerId: {
    type: String,
    default: null,
    maxlength: 255
  },
  stripeSubscriptionId: {
    type: String,
    default: null,
    maxlength: 255
  },
  status: {
    type: String,
    enum: ["active", "canceled", "past_due", "trialing", "incomplete"],
    default: "active"
  },
  currentPeriodStart: {
    type: Date,
    default: null
  },
  currentPeriodEnd: {
    type: Date,
    default: null
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});
export default mongoose.model("Subscription", subscriptionSchema);