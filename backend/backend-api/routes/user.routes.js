
import express from "express";
import { getProfile, updateProfile } from "../controller/user.controller.js";

const router = express.Router();

// Get profile
router.get("/profile/:id", getProfile);

// Update profile
router.put("/profile/:id", updateProfile);

export default router;