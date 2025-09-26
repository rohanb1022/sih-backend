// import Report from "../models/report.model.js";

// // @desc Get hazard analytics (solved/unsolved counts)
// // @route GET /api/reports/get-hazards-analytics
// export const getHazardsAnalytics = async (req, res) => {
//   try {
//     const solvedCount = await Report.countDocuments({ status: "verified" });
//     const unsolvedCount = await Report.countDocuments({ status: "pending" });

//     res.json({
//       success: true,
//       data: {
//         solvedCount,
//         unsolvedCount,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error fetching hazard analytics:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // @desc Get reports that are pending for more than 24 hours
// // @route GET /api/reports/get-unsolved-exceeded
// export const getUnsolvedExceeded = async (req, res) => {
//   try {
//     const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

//     const exceededReports = await Report.find({
//       status: "pending",
//       createdAt: { $lt: twentyFourHoursAgo },
//     }).sort({ createdAt: 1 });

//     res.json({
//       success: true,
//       data: exceededReports,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching exceeded reports:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };







// backend-api/controller/analytics.controller.js

import Report from "../models/report.model.js";
import User from "../models/user.model.js"; // Import the User model
import SOS from "../models/sos.model.js"; // Import the SOS model

// @desc Get analytics for hazard type distribution
// @route GET /api/analytics/hazard-distribution
export const getHazardDistribution = async (req, res) => {
    try {
        const hazardDistribution = await Report.aggregate([
            {
                $group: {
                    _id: "$hazardType",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    hazardType: "$_id",
                    count: 1,
                },
            },
        ]);

        res.json({
            success: true,
            data: hazardDistribution,
        });
    } catch (error) {
        console.error("❌ Error fetching hazard distribution:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc Get analytics for reports over time
// @route GET /api/analytics/reports-over-time
export const getReportsOverTime = async (req, res) => {
    try {
        const reportsOverTime = await Report.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1,
                },
            },
        ]);

        res.json({
            success: true,
            data: reportsOverTime,
        });
    } catch (error) {
        console.error("❌ Error fetching reports over time:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc Get key summary statistics
// @route GET /api/analytics/summary-stats
export const getSummaryStats = async (req, res) => {
    try {
        const totalReports = await Report.countDocuments();
        const verifiedReports = await Report.countDocuments({ status: "verified" });
        const sosSignals = await SOS.countDocuments();
        const activeUsers = await User.distinct("userId", { isOnline: true }); // Assuming you have an isOnline field
        const activeUserCount = activeUsers.length;

        res.json({
            success: true,
            data: {
                totalReports,
                verifiedReports,
                sosSignals,
                activeUsers: activeUserCount,
            },
        });
    } catch (error) {
        console.error("❌ Error fetching summary stats:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc Get reports that are pending for more than 24 hours
// @route GET /api/analytics/unsolved-exceeded
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

// You can merge the old getHazardsAnalytics into getSummaryStats for simplicity
// @desc Get hazard analytics (solved/unsolved counts)
// @route GET /api/analytics/get-hazards-analytics
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