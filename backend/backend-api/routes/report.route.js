import express from "express";
import multer from "multer";
import { createReport, getReports, getReportsNear, ingestAutomatedReport, updateReportStatus } from "../controller/report.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/internal/ingest", ingestAutomatedReport);

router.post("/report", protectRoute, upload.single("media"), createReport);
router.get("/getall", getReports);
router.get("/near", getReportsNear);

router.patch("/status/:id", protectRoute, updateReportStatus);


export default router;