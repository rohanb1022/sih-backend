import Report from "../models/Report.model.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// Create a new report
export const createReport = async (req, res) => {
  try {
    const { hazardType, description, latitude, longitude } = req.body;
    let mediaUrl = null;

    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        folder: "ocean-hazards",
        resource_type: "auto",
      });
      mediaUrl = uploadRes.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const report = await Report.create({
      userId: req.user.id,
      hazardType,
      description,
      mediaUrl,
      latitude,
      longitude,
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error("❌ Error creating report:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all reports (with filters)
export const getReports = async (req, res) => {
  try {
    const { hazardType, startDate, endDate } = req.query;
    const query = {};

    if (hazardType) query.hazardType = hazardType;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const reports = await Report.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error("❌ Error fetching reports:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get nearby reports (manual haversine calculation)
export const getReportsNear = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    const reports = await Report.find({});
    const R = 6371000; // Earth radius in meters

    const nearbyReports = reports.filter((report) => {
      const dLat = (report.latitude - latitude) * (Math.PI / 180);
      const dLon = (report.longitude - longitude) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(latitude * (Math.PI / 180)) *
          Math.cos(report.latitude * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance <= radius;
    });

    res.json({ success: true, data: nearbyReports });
  } catch (error) {
    console.error("❌ Error fetching nearby reports:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
