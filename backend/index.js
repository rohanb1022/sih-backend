import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createExpressApp } from './backend-api/server.js';
import { attachWebSocketServer } from './backend-ws/server.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (MONGO_URI) {
      await mongoose.connect(MONGO_URI);
      console.log('✅ Connected to MongoDB');
    } else {
      console.log('ℹ️ MONGODB_URI not set, skipping Mongo connection');
    }

    const app = createExpressApp();
    const server = http.createServer(app);

    attachWebSocketServer(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server and Websocket running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
}

startServer();