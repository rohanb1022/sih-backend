import express from "express";
import { getHazardsAnalytics, getUnsolvedExceeded } from "../controller/analytics.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import multer from "multer";

const router = express.Router();

// Analytics routes
router.get("/get-hazards-analytics", protectRoute, getHazardsAnalytics);
router.get("/get-unsolved-exceeded", protectRoute, getUnsolvedExceeded);


export default router;