import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
  process.exit(1);
}

// A Map to store connected users, with userId as the key.
const connectedUsers = new Map();

// Verifies the JWT token and returns the userId if valid.
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    console.error('Invalid token:', error.message);
    return null;
  }
}

// Attaches the WebSocket server to a given HTTP server.
export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    // 1. Authenticate user on connection
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(1008, 'Token not provided');
      return;
    }

    const userId = verifyToken(token);
    if (!userId) {
      ws.close(1008, 'Invalid token');
      return;
    }
    
    // Store the authenticated user
    connectedUsers.set(userId, { ws, dataIntervalId: null });
    console.log(`✅ User connected: ${userId}`);
    ws.send(JSON.stringify({ type: 'connection_ack', message: 'Authenticated successfully' }));

    // 2. Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        const user = connectedUsers.get(userId);
        if (!user) return;

        console.log(`[${userId}] sent: ${message.type}`);

        switch (message.type) {
          // --- SOS Notification Case ---
          case 'sos':
            console.log(`🚨 SOS received from ${userId}:`, message.payload);
            // In a real app: save to DB, alert admins, etc.
            ws.send(JSON.stringify({
              type: 'sos_ack',
              status: 'received',
              timestamp: new Date().toISOString()
            }));
            break;

          // --- Real-time Data Streaming Cases ---
          case 'request_realtime_data':
            if (user.dataIntervalId) {
                // Interval is already running, so do nothing.
                return;
            }
            const intervalId = setInterval(() => {
              // Generate dummy data
              const dummyData = {
                type: 'realtime_data_update',
                payload: {
                  heartRate: Math.floor(Math.random() * (120 - 60 + 1)) + 60, // bpm
                  location: {
                    lat: 19.2183 + (Math.random() - 0.5) * 0.01,
                    lng: 72.9781 + (Math.random() - 0.5) * 0.01,
                  },
                  timestamp: new Date().toISOString()
                }
              };
              ws.send(JSON.stringify(dummyData));
            }, 2000); // Send data every 2 seconds

            user.dataIntervalId = intervalId;
            ws.send(JSON.stringify({ type: 'data_streaming_started' }));
            break;
            
          case 'stop_realtime_data':
             if (user.dataIntervalId) {
                clearInterval(user.dataIntervalId);
                user.dataIntervalId = null;
                ws.send(JSON.stringify({ type: 'data_streaming_stopped' }));
             }
            break;

          default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
      } catch (e) {
        console.error('Failed to process message:', e);
      }
    });

    // 3. Handle disconnection
    ws.on('close', () => {
      const user = connectedUsers.get(userId);
      if (user) {
        // IMPORTANT: Clear any running intervals to prevent memory leaks
        if (user.dataIntervalId) {
          clearInterval(user.dataIntervalId);
        }
        connectedUsers.delete(userId);
        console.log(`❌ User disconnected: ${userId}`);
      }
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error for user ${userId}:`, error);
    });
  });

  console.log('🚀 WebSocket Server is attached and running.');
}