import supabase from '../config/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export async function uploadFiles(file) {
    if (!file) throw new Error('No file provided');

    const uniqueId = uuidv4();
    const filePath = `uploads/${uniqueId}-${file.originalname}`;

    console.log('Uploading file:', file.originalname);

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file.buffer, { upsert: false });

    if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw uploadError;
    }

    // Set expiry 24 hours later
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Insert metadata in DB
    const { data, error: insertError } = await supabase
        .from('files')
        .insert([
            { filename: file.originalname, path: filePath, expires_at: expiresAt },
        ])
        .select();

    if (insertError) {
        console.error('DB insert error:', insertError);
        throw insertError;
    }

    return {
        message: 'File uploaded successfully',
        id: data[0].id,
        expiresAt,
    };
}

export const TEMP_DIR = path.join(process.cwd(), 'uploads' , 'temp');

export function ensureTempDir() {
    if(!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
}

export function cleanupTempFiles() {
    fs.readdirSync(TEMP_DIR).forEach(file => {fs.unlinkSync(path.join(TEMP_DIR, file));});
}      