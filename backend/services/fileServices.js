// import supabase from '../config/supabaseClient.js';
// import { v4 as uuidv4 } from 'uuid';

// export async function uploadFiles(files) {
//     if (!files || files.length === 0) {
//         throw new Error('No files provided');
//     }

//     const uploadedFiles = [];

//     for (const file of files) {
//         const uniqueId = uuidv4();
//         const filePath = `uploads/${uniqueId}-${file.originalname}`;

//         // Upload the file buffer to Supabase Storage
//         const { error: uploadError } = await supabase.storage
//             .from('uploads')
//             .upload(filePath, file.buffer, { upsert: false });

//         if (uploadError) {
//             console.error('Supabase upload error:', uploadError);
//             throw new Error(`Failed to upload file ${file.originalname}: ${uploadError.message}`);
//             continue;
//         }
//         //calculate 24hr expiry time
//         const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

//         // Store file metadata in DB
//         const { data, error: insertError } = await supabase
//             .from('files')
//             .insert([
//                 {
//                     filename: file.originalname,
//                     path: filePath,
//                     expires_at: expiresAt,
//                 },
//             ])
//             .select();

//         if (insertError) {
//             throw new Error(`Failed to insert file record for ${file.originalname}: ${insertError.message}`);
//             continue;
//         }

//         uploadedFiles.push({
//             id: data[0].id,
//             filename: file.originalname,
//             expiresAt,
//             message: 'File uploaded successfully',
//         });
//     }
//     return {
//         message: 'Upload completed',
//         uploadedCount: uploadedFiles.length,
//         files: uploadedFiles,
//     };
// }

import supabase from '../config/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

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
