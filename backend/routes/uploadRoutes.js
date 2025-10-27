import express from 'express';
import multer from 'multer';
import { uploadFiles } from '../services/fileServices.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.array('files', 12), async (req, res) => {
    try {
        console.log('Received files:', req.files);
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const results = [];
        for (const file of files) {
            const result = await uploadFiles(file);
            results.push(result);
        }
        res.status(200).json({ message: 'Files uploaded successfully', data: results });
    }
    catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ message: 'Files upload failed', error });
    }
});
export default router;