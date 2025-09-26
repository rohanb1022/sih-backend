import express from "express";
import { getHazardsAnalytics, getUnsolvedExceeded, getHazardDistribution, getReportsOverTime, getSummaryStats } from "../controller/analytics.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import multer from "multer";

const router = express.Router();

router.get("/hazard-distribution", protectRoute, getHazardDistribution);
router.get("/reports-over-time", protectRoute, getReportsOverTime);
router.get("/summary-stats", protectRoute, getSummaryStats);


// Analytics routes
router.get("/get-hazards-analytics", protectRoute, getHazardsAnalytics);
router.get("/get-unsolved-exceeded", protectRoute, getUnsolvedExceeded);


export default router;