import express from "express";
import authRoutes from "./routes/auth.routes.js";
import connectDB from "./config/db.js";
import reportRoutes from "./routes/report.route.js";
import userRoutes from "./routes/user.routes.js";


export function createExpressApp() {
  
  const app = express();
  app.use(express.json());
  
  // Connect to MongoDB 
  connectDB();
  
  // Basic route
  app.get("/", (req, res) => {
    res.send("API is running...");
  });

  // after other routes
  
  // Routes
  app.use("/api/users", userRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/reports", reportRoutes);

  return app;
}
