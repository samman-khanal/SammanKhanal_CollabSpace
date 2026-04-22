import mongoose from "mongoose";
const schema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});
export default mongoose.model("Column", schema);