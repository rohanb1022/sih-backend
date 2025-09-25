import express from "express";
import { rejectPost , createReport} from "../controller/admin.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Route to reject and delete a fake post
router.delete("/reject/:postId", protectRoute, rejectPost);
router.post("/create-report" , protectRoute , createReport );

export default router;