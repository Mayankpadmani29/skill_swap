import mongoose from "mongoose";

const skillSwapRequestSchema = new mongoose.Schema({
  toPost:{
    type : mongoose.Schema.Types.ObjectId,
    ref : "SkillSwapPost"
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  skillOffered: {
    type: String,
    required: true,
  },
  skillWanted: {
    type: String,
    required: true,
  },
  message : {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("SkillSwapRequest", skillSwapRequestSchema);
