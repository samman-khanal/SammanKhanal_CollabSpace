import mongoose from "mongoose";
const schema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  }],
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
    index: true
  }
}, {
  timestamps: true
});
schema.index({
  workspace: 1,
  participants: 1
});
export default mongoose.model("DMConversation", schema);