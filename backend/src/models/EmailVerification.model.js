import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  token: {
    type: String,
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});
schema.index({
  expiresAt: 1
}, {
  expireAfterSeconds: 86400
});
export default mongoose.model("EmailVerification", schema);