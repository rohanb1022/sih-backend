// backend-api/models/sos.model.js
import mongoose from "mongoose";

const sosSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved"],
      default: "pending",
    },
    respondedBy: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("SOS", sosSchema);
