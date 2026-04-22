import mongoose from "mongoose";
const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email address"]
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});
export default mongoose.model("ContactMessage", contactMessageSchema);