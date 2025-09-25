import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import reportRoutes from "./routes/report.route.js";

export function createExpressApp() {
  dotenv.config();

  const app = express();
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("API is running...");
  });

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/reports", reportRoutes);

  return app;
}
