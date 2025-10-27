import express from "express";
import { startDiscovery, stopDiscovery, getPeers } from "../services/udpDiscovery.js";

const router = express.Router();
let discoveryInstance = null;

// Start discovery
router.post("/start", async (req, res) => {
    try {
        const { id, name, port } = req.body;
        if (!id || !name || !port) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (discoveryInstance) {
            return res.status(400).json({ message: "Discovery already running" });
        }

        discoveryInstance = startDiscovery({
            id,
            name,
            port,
            meta: { app: "LocalShare", version: "1.0" },
        });

        res.status(200).json({ message: "Discovery started successfully" });
    } catch (err) {
        console.error("Error starting discovery:", err);
        res.status(500).json({ message: "Failed to start discovery", error: err.message });
    }
});

// Stop discovery
router.post("/stop", async (req, res) => {
    try {
        if (discoveryInstance) {
            discoveryInstance.stop();
            discoveryInstance = null;
            return res.status(200).json({ message: "Discovery stopped successfully" });
        } else {
            return res.status(400).json({ message: "No discovery running" });
        }
    } catch (err) {
        console.error("Error stopping discovery:", err);
        res.status(500).json({ message: "Failed to stop discovery", error: err.message });
    }
});

// Get list of peers
router.get("/", async (req, res) => {
    try {
        const peers = getPeers();
        res.json({ peers });
    } catch (err) {
        console.error("Error fetching peers:", err);
        res.status(500).json({ message: "Failed to get peers", error: err.message });
    }
});

export default router;
