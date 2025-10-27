import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoute from './routes/uploadRoutes.js';
import listRoute from './routes/listRoutes.js';
import downloadRoute from './routes/downloadRoutes.js';
// import cleanupRoute from './routes/cleanupRoutes.js';
import peersRoute from './routes/peersRoute.js';
import { startDiscovery, stopDiscovery } from './services/udpDiscovery.js';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/upload', uploadRoute);
app.use('/download', downloadRoute);
// app.use('/cleanup', cleanupRoute); 
app.use('/list', listRoute);
app.use('/peers', peersRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

const DEVICE_ID = process.env.DEVICE_ID || uuidv4();
const DEVICE_NAME = process.env.DEVICE_NAME || os.hostname();
const LISTEN_PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

const discovery = startDiscovery({
    id: DEVICE_ID,
    name: DEVICE_NAME,
    port: LISTEN_PORT,
    meta: { app: 'ShareApp', version: '1.0' }
});

// Ensure cleanup on exit
process.on('SIGINT', () => {
    try { discovery.stop(); } catch (e) { }
    process.exit();
});
process.on('SIGTERM', () => {
    try { discovery.stop(); } catch (e) { }
    process.exit();
});
