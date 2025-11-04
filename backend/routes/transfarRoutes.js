// backend/routes/transferRoutes.js
import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { TEMP_DIR, ensureTempDir } from "../services/fileServices.js";
import { sendFileOffer } from "../services/connectionService.js";

const router = express.Router();

// Ensure temp directory exists
ensureTempDir();

// Configure Multer for multiple file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, TEMP_DIR),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// 🟢 Send file offer to a specific peer
router.post("/send", upload.array("files"), async (req, res) => {
    try {
        console.log("Incoming upload:", req.files);
        console.log("Body:", req.body);
        const { peerId, from } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        if (!peerId) {
            return res.status(400).json({ message: "Missing peerId" });
        }

        // Prepare simplified file info (for WebSocket message)
        const fileInfos = files.map((file) => ({
            name: file.originalname,
            size: file.size,
            type: file.mimetype,
            tempPath: file.path // keep this internally, not sent to peer
        }));

        // Notify the peer via WebSocket
        sendFileOffer(peerId, fileInfos);

        return res.status(200).json({
            message: `📨 File offer sent to ${peerId}`,
            files: fileInfos.map(({ name, size }) => ({ name, size }))
        });
    } catch (err) {
        console.error("❌ Error in /transfer/send:", err);
        return res.status(500).json({ message: "File transfer failed", error: err.message });
    }
});

// 🧹 Optional: cleanup route for clearing temp uploads
router.delete("/cleanup", (req, res) => {
    try {
        const files = fs.readdirSync(TEMP_DIR);
        files.forEach((f) => fs.unlinkSync(path.join(TEMP_DIR, f)));
        return res.status(200).json({ message: "Temporary uploads cleaned up." });
    } catch (err) {
        console.error("❌ Cleanup error:", err);
        return res.status(500).json({ message: "Failed to clean up temp files" });
    }
});

export default router;
