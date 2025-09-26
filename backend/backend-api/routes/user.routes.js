
import express from "express";
import { getProfile, updateProfile, getAllUsers } from "../controller/user.controller.js";

const router = express.Router();

// Get profile
router.get("/profile/:id", getProfile);

// Update profile
router.put("/profile/:id", updateProfile);

router.get("/profiles", protectRoute, getAllUsers);

export default router;