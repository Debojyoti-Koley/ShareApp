import express from 'express';
import supabase from '../config/supabaseClient.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('files')
            .select('id, filename, path, expires_at, created_at')
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching files:', error);
            return res.status(500).json({ message: 'Error fetching files', error });
        }

        res.status(200).json({ message: 'Files fetched successfully', files: data });
    } catch (error) {
        console.error('Server error fetching files:', error);
        res.status(500).json({ message: 'Server error fetching files', error });
    }
});

export default router;