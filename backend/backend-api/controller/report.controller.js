import Report from "../models/report.model.js";
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
      mediaUrl : "https://www.aljazeera.com/wp-content/uploads/2024/09/AP24254586188844-1726071602.jpg?resize=1800%2C1800",
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

// ... (keep all your existing functions like createReport, getReports, etc.)

// NEW FUNCTION: Update a report's status
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate the new status
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status provided." });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found." });
    }

    report.status = status;
    await report.save();

    res.json({ success: true, data: report });
  } catch (error) {
    console.error("❌ Error updating report status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const ingestAutomatedReport = async (req, res) => {
  try {
    const { title, url, source } = req.body;

    // A simple function to guess the hazard type from the title
    const getHazardTypeFromTitle = (titleText) => {
      const lowerTitle = titleText.toLowerCase();
      if (lowerTitle.includes("cyclone")) return "cyclone";
      if (lowerTitle.includes("tsunami")) return "tsunami";
      if (lowerTitle.includes("flood")) return "flood";
      if (lowerTitle.includes("spill")) return "oil_spill";
      if (lowerTitle.includes("earthquake")) return "earthquake";
      if (lowerTitle.includes("wave")) return "high_waves";
      return "other";
    };

    const report = await Report.create({
      userId: process.env.SYSTEM_USER_ID, // Use the ID from your .env file
      hazardType: getHazardTypeFromTitle(title),
      description: `Automated alert from ${source}: ${title}. Link: ${url}`,
      mediaUrl: null, // Automated reports don't have images initially
      latitude: 20.5937, // Default coordinates (center of India)
      longitude: 78.9629, // Can be updated later
      source: source.toLowerCase(), // e.g., "reddit", "newsapi"
    });

    res.status(201).json({ success: true, message: "Automated report ingested successfully", data: report });
  } catch (error) {
    console.error("❌ Error ingesting automated report:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
