import mongoose from "mongoose";
const ALLOWED_MIME_PREFIXES = ["image/", "application/pdf", "text/", "video/", "audio/"];
const schema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
    index: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fileName: {
    type: String,
    required: true,
    maxlength: 500
  },
  mimeType: {
    type: String,
    required: true,
    validate: {
      //* Function for validator
      validator: v => ALLOWED_MIME_PREFIXES.some(p => v.startsWith(p)),
      message: "Unsupported file type"
    }
  },
  size: {
    type: Number,
    required: true,
    max: 10 * 1024 * 1024
  },
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});
export default mongoose.model("Attachment", schema);