import mongoose from "mongoose";
const NOTIFICATION_TYPES = ["task_assigned", "task_comment", "mention", "dm_message", "board_created", "board_deleted", "channel_created", "channel_deleted", "member_joined", "member_removed", "role_changed", "system_announcement"];
const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: NOTIFICATION_TYPES
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  meta: {
    type: Object,
    default: {}
  },
  readAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});
schema.index({
  user: 1,
  readAt: 1,
  createdAt: -1
});
export default mongoose.model("Notification", schema);