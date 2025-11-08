import dgram from 'dgram';
import os from 'os';

const BROADCAST_PORT = process.env.UDPDISCOVERY_PORT ? Number(process.env.UDPDISCOVERY_PORT) : 41234;
const BROADCAST_INTERVAL = 3000;
const PEER_TTL = 15000; // Consider peer dead if not seen within this time
const BROADCAST_ADDRESS = '255.255.255.255';

// Store discovered peers
const peers = new Map();

let broadcaster;
let listener;
let broadcastIntervalHandle;
let cleanupIntervalHandle;

// ---------- Utility: Get local IPs ----------
function getLocalIPAddresses() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address);
            }
        }
    }
    return ips;
}

// ---------- Utility: Build presence packet ----------
function makePresencePayload({ id, name, port, meta }) {
    return JSON.stringify({
        id,
        name,
        port,
        meta: meta || {},
        timestamp: new Date().toISOString()
    });
}

// ---------- Main function ----------
export function startDiscovery({ id, name, port, meta } = {}) {
    if (!id || !name || !port) {
        throw new Error("id, name, and port are required to start discovery");
    }

    const localIPs = getLocalIPAddresses();
    console.log(`🌐 Local IPs: ${localIPs.join(', ')}`);

    // Create UDP sockets
    broadcaster = dgram.createSocket('udp4');
    listener = dgram.createSocket('udp4');

    // Enable broadcast
    broadcaster.bind(() => {
        broadcaster.setBroadcast(true);
        console.log(`📡 [Discovery] Broadcaster ready for ${name} (${id})`);
    });

    // Listen for incoming broadcasts
    listener.bind(BROADCAST_PORT, () => {
        console.log(`👂 [Discovery] Listening for broadcasts on port ${BROADCAST_PORT}`);
    });

    // Handle incoming messages
    listener.on('message', (msgBuffer, rinfo) => {
        try {
            const payload = JSON.parse(msgBuffer.toString('utf8'));

            if (!payload || !payload.id) return;

            // Ignore self broadcasts
            if (localIPs.includes(rinfo.address) && payload.id === id) return;

            const now = Date.now();
            const existing = peers.get(payload.id);

            peers.set(payload.id, {
                id: payload.id,
                name: payload.name || payload.id,
                ip: rinfo.address,
                port: payload.port,
                meta: payload.meta || {},
                lastSeen: now,
                rawTimestamp: payload.timestamp,
            });

            if (!existing) {
                console.log(`🆕 [Peer Found] ${payload.name} (${rinfo.address}:${payload.port})`);
            } else {
                // console.log(`🔁 [Peer Updated] ${payload.name} (${rinfo.address})`);
            }
        } catch (err) {
            console.error("❌ [Discovery] Error parsing UDP message:", err.message);
        }
    });

    // Broadcast presence periodically
    broadcastIntervalHandle = setInterval(() => {
        try {
            const payload = makePresencePayload({ id, name, port, meta });
            const message = Buffer.from(payload, 'utf8');
            broadcaster.send(message, 0, message.length, BROADCAST_PORT, BROADCAST_ADDRESS, (err) => {
                if (err) {
                    console.error(`❌ [Discovery] Broadcast error: ${err.message}`);
                } else {
                    // console.log(`📢 [Discovery] Broadcasting presence as ${name} on ${id}:${port}`);
                }
            });
        } catch (err) {
            console.error("❌ [Discovery] Broadcast failed:", err.message);
        }
    }, BROADCAST_INTERVAL);

    // Clean up stale peers
    cleanupIntervalHandle = setInterval(() => {
        const cutoff = Date.now() - PEER_TTL;
        for (const [peerId, p] of peers) {
            if (p.lastSeen < cutoff) {
                console.log(`⚰️ [Discovery] Peer ${p.name} (${p.ip}) removed (stale)`);
                peers.delete(peerId);
            }
        }
    }, Math.max(3000, Math.floor(PEER_TTL / 2)));

    console.log(`🚀 [Discovery] Started for ${name} (${id}) on port ${port}`);
    return { stop: stopDiscovery };
}

// ---------- Stop discovery gracefully ----------
export function stopDiscovery() {
    console.log("🛑 [Discovery] Stopping discovery...");
    try {
        if (broadcastIntervalHandle) clearInterval(broadcastIntervalHandle);
        if (cleanupIntervalHandle) clearInterval(cleanupIntervalHandle);

        if (broadcaster) {
            broadcaster.close();
            broadcaster = null;
            console.log("📴 Broadcaster closed.");
        }
        if (listener) {
            listener.close();
            listener = null;
            console.log("📴 Listener closed.");
        }

        peers.clear();
        console.log("🧹 Peers cleared.");
    } catch (error) {
        console.error("❌ [Discovery] Error stopping discovery:", error.message);
    }
}

// ---------- Get peers ----------
export function getPeers() {
    return Array.from(peers.values());
}
