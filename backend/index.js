import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

import uploadRoute from './routes/uploadRoutes.js';
import listRoute from './routes/listRoutes.js';
import downloadRoute from './routes/downloadRoutes.js';
import peersRoute from './routes/peersRoute.js';
import { startDiscovery, stopDiscovery } from './services/udpDiscovery.js';
import { startWebSocketServer } from './services/connectionService.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- ROUTES --------------------
app.use('/upload', uploadRoute);
app.use('/download', downloadRoute);
app.use('/list', listRoute);
app.use('/peers', peersRoute);

// -------------------- SERVER + WEBSOCKET --------------------
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const server = http.createServer(app);

// Start WebSocket server (for direct peer communication)
startWebSocketServer(server);

// -------------------- DEVICE INFO --------------------
const DEVICE_ID = process.env.DEVICE_ID || uuidv4();
const DEVICE_NAME = process.env.DEVICE_NAME || os.hostname();

// -------------------- UDP DISCOVERY --------------------
console.log('🔍 Starting local peer discovery...');
const discovery = startDiscovery({
    id: DEVICE_ID,
    name: DEVICE_NAME,
    port: PORT, // Same port as the main HTTP/WebSocket server
    meta: { app: 'ShareApp', version: '1.0' },
});

// -------------------- START EXPRESS SERVER --------------------
server.listen(PORT, () => {
    console.log(`🚀 HTTP + WebSocket server running on port ${PORT}`);
    console.log(`💻 Device ID: ${DEVICE_ID}`);
    console.log(`🧭 Device Name: ${DEVICE_NAME}`);
});

// -------------------- CLEANUP HANDLERS --------------------
function cleanup() {
    console.log('\n🛑 Shutting down gracefully...');
    try {
        stopDiscovery();
    } catch (err) {
        console.error('❌ Error stopping discovery:', err.message);
    }

    server.close(() => {
        console.log('📴 Server closed.');
        process.exit(0);
    });
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
