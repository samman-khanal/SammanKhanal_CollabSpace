import mongoose from "mongoose";
import { ROLES } from "../constants/roles.constant.js";
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    maxlength: 200
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email address"]
  },
  passwordHash: {
    type: String,
    default: null
  },
  googleId: {
    type: String,
    default: null,
    index: true,
    sparse: true
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.USER
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  avatarUrl: {
    type: String,
    default: ""
  },
  passwordChangedAt: {
    type: Date,
    default: null
  },
  isBanned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});
export default mongoose.model("User", userSchema);