import Report from "../models/report.model.js";

// Get all reports for map display
export const getMapReports = async (req, res) => {
  try {
    const { hazardType } = req.query;
    const query = {};
    if (hazardType) query.hazardType = hazardType;

    const reports = await Report.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error("❌ Error fetching map reports:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get reports near a location (radius in meters)
export const getReportsNearby = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    if (!latitude || !longitude || !radius) {
      return res.status(400).json({ success: false, message: "Latitude, longitude, and radius required" });
    }

    const reports = await Report.find({});
    const R = 6371000; // Earth radius in meters

    const nearbyReports = reports.filter((report) => {
      const dLat = (report.latitude - latitude) * (Math.PI / 180);
      const dLon = (report.longitude - longitude) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(latitude * (Math.PI / 180)) *
        Math.cos(report.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance <= parseFloat(radius);
    });

    res.json({ success: true, data: nearbyReports });
  } catch (error) {
    console.error("❌ Error fetching nearby reports:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get hotspots (clusters) based on reports
export const getHotspots = async (req, res) => {
  try {
    const reports = await Report.find({});

    // Simple clustering by rounding coordinates
    const clusterPrecision = 1; // decimal places to round lat/lon
    const clusters = {};

    reports.forEach((report) => {
      const latKey = report.latitude.toFixed(clusterPrecision);
      const lonKey = report.longitude.toFixed(clusterPrecision);
      const key = `${latKey}_${lonKey}`;

      if (!clusters[key]) clusters[key] = { latitude: parseFloat(latKey), longitude: parseFloat(lonKey), count: 0, types: {} };
      clusters[key].count += 1;
      clusters[key].types[report.hazardType] = (clusters[key].types[report.hazardType] || 0) + 1;
    });

    const hotspots = Object.values(clusters);
    res.json({ success: true, data: hotspots });
  } catch (error) {
    console.error("❌ Error fetching hotspots:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};