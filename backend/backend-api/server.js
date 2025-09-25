import express from "express";
import authRoutes from "./routes/auth.routes.js";
import connectDB from "./config/db.js";
import reportRoutes from "./routes/report.route.js";
import { getMapReports } from "./controller/map.controller.js";

export function createExpressApp() {

  const app = express();
  app.use(express.json());

  // Connect to MongoDB 
  connectDB();
  
  // Basic route
  app.get("/", (req, res) => {
    res.send("API is running...");
  });

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/map", getMapReports);

  return app;
}
