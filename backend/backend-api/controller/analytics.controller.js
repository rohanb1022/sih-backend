import Report from "../models/report.model.js";

// @desc Get hazard analytics (solved/unsolved counts)
// @route GET /api/reports/get-hazards-analytics
export const getHazardsAnalytics = async (req, res) => {
  try {
    const solvedCount = await Report.countDocuments({ status: "verified" });
    const unsolvedCount = await Report.countDocuments({ status: "pending" });

    res.json({
      success: true,
      data: {
        solvedCount,
        unsolvedCount,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching hazard analytics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Get reports that are pending for more than 24 hours
// @route GET /api/reports/get-unsolved-exceeded
export const getUnsolvedExceeded = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const exceededReports = await Report.find({
      status: "pending",
      createdAt: { $lt: twentyFourHoursAgo },
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: exceededReports,
    });
  } catch (error) {
    console.error("❌ Error fetching exceeded reports:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};