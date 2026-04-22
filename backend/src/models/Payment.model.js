import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema({
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
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true,
    maxlength: 255
  },
  stripeInvoiceId: {
    type: String,
    default: null,
    maxlength: 255
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: "usd",
    maxlength: 10
  },
  status: {
    type: String,
    enum: ["pending", "succeeded", "failed", "refunded"],
    default: "pending"
  },
  paymentMethod: {
    type: String,
    default: null,
    maxlength: 255
  },
  receiptUrl: {
    type: String,
    default: null,
    maxlength: 2048
  },
  description: {
    type: String,
    default: "",
    maxlength: 500
  }
}, {
  timestamps: true
});
export default mongoose.model("Payment", paymentSchema);