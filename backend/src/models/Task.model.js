import mongoose from "mongoose";
import { TASK_PRIORITY } from "../constants/taskPriority.constant.js";
const schema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true,
    index: true
  },
  column: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Column",
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  description: {
    type: String,
    default: "",
    maxlength: 10000
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  dueDate: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: Object.values(TASK_PRIORITY),
    default: TASK_PRIORITY.MEDIUM
  },
  completed: {
    type: Boolean,
    default: false
  },
  checklist: [{
    text: {
      type: String,
      required: true,
      maxlength: 1000
    },
    done: {
      type: Boolean,
      default: false
    }
  }],
  order: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});
export default mongoose.model("Task", schema);