import express from 'express';
import supabase from '../config/supabaseClient.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // find the file in db
        const { data, error } = await supabase.from('files').select('path,filename,expires_at').eq('id', id).single();

        if (error || !data) {
            return res.status(404).json({ message: 'File not found', error });
        }

        // check if expired
        if (new Date(data.expires_at) < new Date()) {
            return res.status(410).json({ message: 'File has expired' });
        }

        // generate a single download link valid for 60s
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('uploads').createSignedUrl(data.path, 60);
        if (signedUrlError || !signedUrlData) {
            return res.status(500).json({ message: 'Error generating download link', error: signedUrlError });
        }

        // send url to frontend
        res.status(200).json({ message: 'Download link generated', downloadUrl: signedUrlData.signedUrl, filename: data.filename });

    } catch (error) {
        console.error('Error in download link generation:', error);
        res.status(500).json({ message: 'Server error generating download link', error });
    }
});
export default router;