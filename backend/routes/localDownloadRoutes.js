// backend/routes/localDownloadRoutes.js
import express from "express";
import fs from "fs";
import path from "path";
import { TEMP_DIR } from "../services/fileServices.js";

const router = express.Router();

// Download a file from local temp storage
router.get("/:filename", (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(TEMP_DIR, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found locally" });
    }

    res.download(filePath, fileName, (err) => {
        if (err) {
            console.error("❌ Error during local file download:", err);
            res.status(500).json({ message: "Local file download failed" });
        }
    });
});

export default router;
