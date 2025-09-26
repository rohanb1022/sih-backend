// import mongoose from "mongoose";

// const reportSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     hazardType: {
//       type: String,
//       enum: ["flood", "tsunami", "oil_spill", "high_waves", "other"],
//       required: true,
//     },
//     description: {
//       type: String,
//     },
//     mediaUrl: {
//       type: String, // Cloudinary URL
//     },
//     latitude: {
//       type: Number,
//       required: true,
//     },
//     longitude: {
//       type: Number,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "verified", "rejected"],
//       default: "pending",
//     },
//     source: {
//       type: String,
//       enum: ["user", "reddit", "newsapi", "google_alerts","google alerts"],
//       default: "user",
//     },
//   },
//   { timestamps: true }
// );

// const Report = mongoose.model("Report", reportSchema);
// export default Report;

import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hazardType: {
      type: String,
      enum: ["flood", "tsunami", "oil_spill", "high_waves", "other"],
      required: true,
    },
    description: {
      type: String,
    },
    mediaUrl: {
      type: String, // Cloudinary URL
      default: null,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    source: {
      type: String,
      enum: ["user", "reddit", "newsapi", "google_alerts", "google alerts"],
      default: "user",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Report || mongoose.model("Report", reportSchema);