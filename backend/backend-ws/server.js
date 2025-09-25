import { WebSocketServer } from "ws";
import Report from "../backend-api/models/report.model.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ FATAL ERROR: JWT_SECRET is not defined in .env file.");
  process.exit(1);
}

const connectedUsers = new Map();

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    let userId;
    let isAdmin = false; // flag for admin user

    console.log("✅ New client connected, waiting for userId...");

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        // Step 1: Client sends userId first (and optional admin flag)
        if (message.type === "connect" && message.payload?.userId) {
          userId = message.payload.userId;
          isAdmin = message.payload.isAdmin || false;
          connectedUsers.set(userId, { ws, location: null, dataIntervalId: null, isAdmin });
          ws.send(JSON.stringify({ type: "connection_ack", message: `User ${userId} connected.` }));
          console.log(`User connected: ${userId} (Admin: ${isAdmin})`);
          return;
        }

        if (!userId) {
          ws.send(JSON.stringify({ type: "error", message: "Send userId first." }));
          return;
        }

        const user = connectedUsers.get(userId);
        if (!user) return;

        // Step 2: Update location
        if (message.type === "update_location") {
          const { latitude, longitude } = message.payload;
          if (latitude == null || longitude == null) {
            ws.send(JSON.stringify({ type: "error", message: "Latitude & longitude required" }));
            return;
          }

          user.location = { latitude, longitude };

          const reports = await Report.find({});
          const nearbyReports = reports.filter((report) =>
            calculateDistance(latitude, longitude, report.latitude, report.longitude) <= 3000
          );

          ws.send(JSON.stringify({ type: "nearby_reports", payload: nearbyReports, timestamp: new Date() }));
        }

        // Step 3: Start/stop realtime updates
        if (message.type === "start_realtime_updates" && !user.dataIntervalId) {
          user.dataIntervalId = setInterval(async () => {
            if (!user.location) return;
            const reports = await Report.find({});
            const nearbyReports = reports.filter((report) =>
              calculateDistance(user.location.latitude, user.location.longitude, report.latitude, report.longitude) <= 3000
            );
            ws.send(JSON.stringify({ type: "realtime_data_update", payload: nearbyReports, timestamp: new Date() }));
          }, 5000);

          ws.send(JSON.stringify({ type: "data_streaming_started" }));
        }

        if (message.type === "stop_realtime_updates" && user.dataIntervalId) {
          clearInterval(user.dataIntervalId);
          user.dataIntervalId = null;
          ws.send(JSON.stringify({ type: "data_streaming_stopped" }));
        }

        // Step 4: SOS notification
        if (message.type === "sos_notification") {
          const { latitude, longitude, msg } = message.payload;
          if (!latitude || !longitude || !msg) {
            ws.send(JSON.stringify({ type: "error", message: "Location and message required for SOS" }));
            return;
          }

          // Send to all admins
          connectedUsers.forEach((usr, id) => {
            if (usr.isAdmin) {
              usr.ws.send(JSON.stringify({
                type: "sos_received",
                payload: {
                  userId,
                  latitude,
                  longitude,
                  message: msg,
                  timestamp: new Date(),
                }
              }));
            }
          });

          ws.send(JSON.stringify({ type: "sos_sent", message: "SOS notification sent to admin(s)." }));
        }

        // Step 5: Admin response to SOS
        if (message.type === "sos_response") {
          const { targetUserId, responseMsg } = message.payload;
          if (!targetUserId || !responseMsg) {
            ws.send(JSON.stringify({ type: "error", message: "targetUserId and responseMsg required" }));
            return;
          }

          const targetUser = connectedUsers.get(targetUserId);
          if (targetUser) {
            targetUser.ws.send(JSON.stringify({
              type: "sos_response",
              payload: {
                fromAdmin: userId,
                message: responseMsg,
                timestamp: new Date(),
              }
            }));
          }
        }

      } catch (e) {
        console.error("Failed to process message:", e);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    });

    ws.on("close", () => {
      if (userId && connectedUsers.get(userId)?.dataIntervalId) {
        clearInterval(connectedUsers.get(userId).dataIntervalId);
      }
      connectedUsers.delete(userId);
      console.log(`❌ User disconnected: ${userId}`);
    });

    ws.on("error", (err) => console.error("WS Error:", err));
  });

  console.log("🚀 WebSocket Server is running.");
}
