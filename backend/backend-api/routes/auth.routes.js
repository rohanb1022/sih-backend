import express from "express";
import { signup, login, checkAuth } from "../controller/auth.controller.js";
import { protectRoute, authorizeRoles } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/check", protectRoute, checkAuth);

// Example protected routes
router.get("/user-dashboard", protectRoute, authorizeRoles("user"), (req, res) => {
  res.json({ message: "Welcome User Dashboard" });
});

router.get("/admin-dashboard", protectRoute, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin Dashboard" });
});

export default router;
