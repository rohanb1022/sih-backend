import express from "express";
import { getMapReports, getReportsNearby, getHotspots } from "../controller/map.controller.js";

const router = express.Router();

router.get("/all", getMapReports);           // All reports
router.get("/nearby", getReportsNearby);     // Reports near user
router.get("/hotspots", getHotspots);        // Hotspot clusters

export default router;