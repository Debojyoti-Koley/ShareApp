import express from "express";
import { startDiscovery, stopDiscovery, getPeers } from "../services/udpDiscovery.js";
import { connectToPeer } from "../services/connectionService.js";

const router = express.Router();
let discoveryInstance = null;

// 🟢 Start UDP discovery
router.post("/start", async (req, res) => {
    try {
        const { id, name, port } = req.body;
        if (!id || !name || !port) {
            return res.status(400).json({ message: "Missing required fields: id, name, port" });
        }

        if (discoveryInstance) {
            return res.status(409).json({ message: "Discovery already running" });
        }

        discoveryInstance = startDiscovery({
            id,
            name,
            port,
            meta: { app: "ShareApp", version: "1.0" },
        });

        console.log(`[Backend-peersRoute.js] Discovery started for ${name} (${id}) on port ${port}`);
        return res.status(200).json({ message: "Discovery started successfully" });
    } catch (err) {
        console.error("[Backend-peersRoute.js] Error starting discovery:", err);
        return res.status(500).json({ message: "Failed to start discovery", error: err.message });
    }
});

// 🔴 Stop UDP discovery
router.post("/stop", async (req, res) => {
    try {
        if (discoveryInstance) {
            discoveryInstance.stop();
            discoveryInstance = null;
            console.log("[Backend-peersRoute.js] Discovery stopped successfully");
            return res.status(200).json({ message: "Discovery stopped successfully" });
        } else {
            return res.status(400).json({ message: "No discovery currently running" });
        }
    } catch (err) {
        console.error("[Backend-peersRoute.js] Error stopping discovery:", err);
        return res.status(500).json({ message: "Failed to stop discovery", error: err.message });
    }
});

// 📡 Fetch list of discovered peers
router.get("/", async (req, res) => {
    try {
        const peers = getPeers();
        return res.status(200).json({
            message: "Peers fetched successfully",
            count: peers.length,
            peers,
        });
    } catch (err) {
        console.error("[Backend-peersRoute.js] Error fetching peers:", err);
        return res.status(500).json({ message: "Failed to fetch peers", error: err.message });
    }
});

// 🔗 Connect to a specific peer
router.post("/connect", async (req, res) => {
    try {
        const { peerId } = req.body;
        if (!peerId) {
            return res.status(400).json({ message: "Missing peerId in request body" });
        }

        const ws = await connectToPeer(peerId); // Waits until connection succeeds
        console.log(`[Backend-peersRoute.js] Successfully connected to peer ${peerId}`);

        return res.status(200).json({
            message: `Successfully connected to peer ${peerId}`,
            status: "connected",
            peerId
        });

    } catch (err) {
        console.error("❌ Error connecting to peer:", err);
        return res.status(500).json({
            message: "Failed to connect to peer",
            error: err.message
        });
    }
});


export default router;
