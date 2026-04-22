import mongoose from "mongoose";
const attachmentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    maxlength: 500
  },
  mimeType: {
    type: String,
    maxlength: 100
  },
  size: {
    type: Number,
    max: 10 * 1024 * 1024
  },
  dataBase64: String
}, {
  _id: false
});
const reactionSchema = new mongoose.Schema({
  emoji: {
    type: String,
    required: true,
    maxlength: 20
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  _id: false
});
const schema = new mongoose.Schema({
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channel",
    index: true,
    default: null
  },
  dm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DMConversation",
    index: true,
    default: null
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  content: {
    type: String,
    default: "",
    maxlength: 10000
  },
  attachments: {
    type: [attachmentSchema],
    default: []
  },
  reactions: {
    type: [reactionSchema],
    default: []
  },
  mentions: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    default: []
  },
  editedAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});
schema.index({
  channel: 1,
  createdAt: -1
});
schema.index({
  dm: 1,
  createdAt: -1
});
export default mongoose.model("Message", schema);