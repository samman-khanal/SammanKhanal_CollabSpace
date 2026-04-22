import mongoose from "mongoose";
import { INVITATION_STATUS } from "../constants/invitationStatus.constant.js";
const schema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email address"]
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  token: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: Object.values(INVITATION_STATUS),
    default: INVITATION_STATUS.PENDING
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});
schema.index({
  expiresAt: 1
}, {
  expireAfterSeconds: 604800
});
export default mongoose.model("WorkspaceInvite", schema);