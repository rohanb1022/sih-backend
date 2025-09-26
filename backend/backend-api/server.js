// import express from "express";
// import authRoutes from "./routes/auth.routes.js";
// import adminRoutes from "./routes/admin.route.js";
// import connectDB from "./config/db.js";
// import reportRoutes from "./routes/report.route.js";
// import userRoutes from "./routes/user.routes.js";

// import { getMapReports } from "./controller/map.controller.js";

// export function createExpressApp() {
  
//   const app = express();
//   app.use(express.json());
  
//   // Connect to MongoDB 
//   connectDB();
  
//   // Basic route
//   app.get("/", (req, res) => {
//     res.send("API is running...");
//   });

//   // after other routes
  
//   // Routes
//   app.use("/api/users", userRoutes);
//   app.use("/api/auth", authRoutes);
//   app.use("/api/reports", reportRoutes);
//   app.use("/api/admin", adminRoutes);
//   app.use("/api/map", getMapReports);

//   return app;
// }

import express from "express";
import cors from "cors"; // <-- 1. IMPORT THE CORS PACKAGE
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.route.js";
import connectDB from "./config/db.js";
import reportRoutes from "./routes/report.route.js";
import userRoutes from "./routes/user.routes.js";
import { getMapReports } from "./controller/map.controller.js";
import analyticsRoutes from "./routes/analytics.route.js"

export function createExpressApp() {
  const app = express();

  // --- 2. USE THE CORS MIDDLEWARE ---
  // This tells Express to add the necessary headers to allow requests
  // from any origin. This should come before your routes.
  app.use(cors());
  
  app.use(express.json());
  
  // Connect to MongoDB 
  connectDB();
  
  // Basic route
  app.get("/", (req, res) => {
    res.send("API is running...");
  });

  // Routes
  app.use("/api/users", userRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/map", getMapReports);
  app.use("/api/analytics", analyticsRoutes); 

  return app;
}