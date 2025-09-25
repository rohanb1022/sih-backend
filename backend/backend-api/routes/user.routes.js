import express from "express";
import { getProfile, updateProfile } from "../controller/user.controller.js";

const router = express.Router();

// GET /api/users/me → get profile

// Get profile
router.get("/profile/:id", getProfile);

// Update profile
router.put("/profile/:id", updateProfile);


export default router;