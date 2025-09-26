import Report from "../models/report.model.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// Create a new report
export const createReport = async (req, res) => {
  try {
    const { hazardType, description, latitude, longitude,userId } = req.body;
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
      userId: userId,
      hazardType,
      description,
      mediaUrl : "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.aljazeera.com%2Fgallery%2F2025%2F5%2F27%2Fheavy-rains-lash-mumbai-amid-indias-earliest-monsoon-in-years&psig=AOvVaw0-rrPBhflie1mchohB7S9a&ust=1758962634780000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCNirxMyE9o8DFQAAAAAdAAAAABAE",
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

    // --- NEW LOGIC: Check for duplicates before creating ---
    const existingReport = await Report.findOne({ url: url });

    if (existingReport) {
      // If the report already exists, don't create a new one.
      // Just send a success response to acknowledge the request.
      return res.status(200).json({ success: true, message: "Report already exists." });
    }
    
    // If we get here, the report is new and we should create it.

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
      userId: process.env.SYSTEM_USER_ID,
      hazardType: getHazardTypeFromTitle(title),
      description: `Automated alert from ${source}: ${title}.`, // Removed the link from description
      url: url, // <-- Save the URL to the new dedicated field
      mediaUrl: null,
      latitude: 20.5937,
      longitude: 78.9629,
      source: source.toLowerCase(),
    });

    res.status(201).json({ success: true, message: "Automated report ingested successfully", data: report });
  } catch (error) {
    // This will catch errors, including the "duplicate key" error if two requests try to create at the exact same time.
    console.error("❌ Error ingesting automated report:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
