import websocket, { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { getPeers } from './udpDiscovery.js';
import { ensureTempDir } from './fileServices.js';

let wss;
const activeConnections = new Map(); // peerId → ws
const TEMP_DIR = path.join(process.cwd(), 'uploads', 'temp');

// 🟢 Start WebSocket server
export function startWebSocketServer(server) {
    if (wss) {
        console.log('WebSocket server already running.');
        return wss;
    }

    ensureTempDir();
    wss = new WebSocketServer({ server });
    console.log('✅ WebSocket server started.');

    wss.on('connection', (ws, req) => {
        console.log('🔗 New WebSocket connection from:', req.socket.remoteAddress);

        ws.on('message', async (msg) => {
            try {
                const data = JSON.parse(msg);
                console.log('📨 Received message:', data.type);

                // 🪪 Peer registration
                if (data.type === 'register') {
                    activeConnections.set(data.id, ws);
                    console.log(`Peer registered: ${data.id}`);
                    return;
                }

                // 📁 File offer received
                if (data.type === 'file-offer') {
                    console.log(`📁 File offer from ${data.from}:`, data.files.map(f => f.name));

                    // Here you can auto-accept for now (or wait for user confirmation via frontend)
                    ws.send(JSON.stringify({
                        type: 'file-accept',
                        to: data.from,
                        accepted: true
                    }));
                    return;
                }

                // ✅ File accepted by receiver
                if (data.type === 'file-accept') {
                    if (data.accepted) {
                        console.log(`✅ Receiver accepted file transfer: ${data.to}`);
                    } else {
                        console.log(`❌ Receiver declined file transfer.`);
                    }
                    return;
                }

                // 💾 Incoming file data
                if (data.type === 'file-data') {
                    const { fileName, chunk, isLast } = data;
                    const filePath = path.join(TEMP_DIR, fileName);
                    fs.appendFileSync(filePath, Buffer.from(chunk, 'base64'));
                    if (isLast) {
                        console.log(`✅ File saved locally: ${filePath}`);
                    }
                    return;
                }

            } catch (err) {
                console.error('❌ Invalid message format or processing error:', err);
            }
        });

        ws.on('close', () => {
            for (const [id, socket] of activeConnections) {
                if (socket === ws) {
                    activeConnections.delete(id);
                    console.log(`Peer disconnected: ${id}`);
                }
            }
        });
    });

    process.on('SIGINT', () => {
        console.log('\n🛑 Closing WebSocket server...');
        for (const [, ws] of activeConnections) ws.close();
        if (wss) wss.close();
        process.exit(0);
    });

    return wss;
}

// 🔗 Connect to a discovered peer
export function connectToPeer(peerId) {
    const peers = getPeers();
    const peer = peers.find(p => p.id === peerId);
    if (!peer) throw new Error('Peer not found');

    const url = `ws://${peer.ip}:${peer.port}`;
    const ws = new websocket(url);

    return new Promise((resolve, reject) => {
        ws.on('open', () => {
            console.log(`✅ Connected to peer: ${peerId} at ${url}`);
            activeConnections.set(peerId, ws);
            ws.send(JSON.stringify({ type: 'register', id: peerId }));
            resolve(ws);
        });

        ws.on('error', (err) => {
            console.error(`❌ Connection error with peer ${peerId}:`, err);
            reject(err);
        });

        ws.on('close', () => {
            activeConnections.delete(peerId);
            console.log(`Peer ${peerId} disconnected`);
        });
    });
}

// 📤 Send a file offer to a peer
export function sendFileOffer(peerId, files) {
    const ws = activeConnections.get(peerId);
    if (!ws || ws.readyState !== websocket.OPEN) {
        throw new Error('Peer not connected or socket closed');
    }

    ws.send(JSON.stringify({
        type: 'file-offer',
        from: 'self',
        files: files.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type
        }))
    }));
}

// 📢 Optional: Broadcast helper
export function broadcastMessage(senderId, message) {
    for (const [id, ws] of activeConnections) {
        if (id !== senderId && ws.readyState === websocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
}

// 📩 Notify a specific peer
export function notifyPeer(peerId, message) {
    const ws = activeConnections.get(peerId);
    if (ws && ws.readyState === websocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}
