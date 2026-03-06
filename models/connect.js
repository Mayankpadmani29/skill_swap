// models/Connection.js
import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

// Ensure unique pair of users (connection can't be duplicated)
connectionSchema.index({ users: 1 }, { unique: true });

export default mongoose.model("Connection", connectionSchema);
