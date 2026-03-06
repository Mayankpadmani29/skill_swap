import mongoose from "mongoose";

const skillSwapSchema = new mongoose.Schema({
  userA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userB: {
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
  userAlink: {
    type: String,
    default: "",
  },
  userBlink: {
    type: String,
    default: "",
    // required: true,
  },
  status: {
    type: String,
    enum: ["pending", "active", "completed", "cancelled"],
    default: "pending",
  },
  userACompleted: { type: Boolean, default: false }, // ✅ track userA agreement
  userBCompleted: { type: Boolean, default: false }, // ✅ track userB agreement
  xp: {
    type: Number,
    default: 1000,
  },
  ratingStatus: {
    userARating: { type: Number, default: null },
    userBRating: { type: Number, default: null },
  },
  createdAt: { type: Date, default: Date.now },
});


export default mongoose.model("SkillSwap", skillSwapSchema);
