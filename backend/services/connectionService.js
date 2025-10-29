import websocket, { WebSocketServer } from 'ws';
import { getPeers } from './udpDiscovery.js';

let wss;
const activeConnections = new Map(); // peerId → ws

// 🟢 Start WebSocket server
export function startWebSocketServer(server) {
    if (wss) {
        console.log('WebSocket server already running.');
        return wss;
    }

    wss = new WebSocketServer({ server });
    console.log('✅ WebSocket server started.');

    wss.on('connection', (ws, req) => {
        console.log('🔗 New WebSocket connection from:', req.socket.remoteAddress);

        ws.on('message', (msg) => {
            try {
                const data = JSON.parse(msg);
                console.log('📨 Received message:', data);

                if (data.type === 'register') {
                    activeConnections.set(data.id, ws);
                    console.log(`Peer registered: ${data.id}`);
                }
            } catch (err) {
                console.error('❌ Invalid message format:', err);
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

// 📢 Optional: Broadcast helper
export function broadcastMessage(senderId, message) {
    for (const [id, ws] of activeConnections) {
        if (id !== senderId && ws.readyState === websocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
}
