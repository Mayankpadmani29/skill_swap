import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    to:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true },
    deliveredAt: { type: Date, default: null },
    readAt: { type: Date, default: null }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

// Fast lookups for DM threads
messageSchema.index({ from: 1, to: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
