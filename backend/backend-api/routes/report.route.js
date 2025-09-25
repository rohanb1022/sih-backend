import express from "express";
import multer from "multer";
import { createReport, getReports, getReportsNear } from "../controller/report.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/report", protectRoute, upload.single("media"), createReport);
router.get("/getall", getReports);
router.get("/near", getReportsNear);

export default router;