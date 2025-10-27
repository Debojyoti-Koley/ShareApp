import express from 'express';
import { getPeers } from '../services/udpDiscovery.js';

const router = express.Router();

router.get('/', (req, res) => {
    try {
        const peers = getPeers();
        res.json({ message: 'Peers fetched', peers});
    }catch (err){
        res.status(500).json({ message: 'Error fetching peers', error: String(err) });
    }
});

export default router;