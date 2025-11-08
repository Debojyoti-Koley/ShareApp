// import websocket, { WebSocketServer } from 'ws';
// import fs from 'fs';
// import path from 'path';
// import { getPeers } from './udpDiscovery.js';
// import { ensureTempDir } from './fileServices.js';

// let wss;
// const activeConnections = new Map(); // peerId → ws
// const TEMP_DIR = path.join(process.cwd(), 'uploads', 'temp');

// // 🟢 Start WebSocket server
// export function startWebSocketServer(server) {
//     if (wss) {
//         console.log('WebSocket server already running.');
//         return wss;
//     }

//     ensureTempDir();
//     wss = new WebSocketServer({ server });
//     console.log('✅ WebSocket server started.');

//     wss.on('connection', (ws, req) => {
//         console.log('🔗 New WebSocket connection from:', req.socket.remoteAddress);

//         ws.on('message', async (msg) => {
//             try {
//                 const data = JSON.parse(msg);
//                 console.log('📨 Received message:', data.type);

//                 // 🪪 Peer registration
//                 if (data.type === 'register') {
//                     activeConnections.set(data.id, ws);
//                     console.log(`Peer registered: ${data.id}`);
//                     return;
//                 }

//                 // 📁 File offer received (receiver side)
//                 if (data.type === 'file-offer') {
//                     console.log(`📁 File offer from ${data.from}:`, data.files.map(f => f.name));

//                     // Auto-accept for now
//                     ws.send(JSON.stringify({
//                         type: 'file-accept',
//                         to: data.from,
//                         accepted: true
//                     }));
//                     console.log('✅ Auto-accepted file offer');
//                     return;
//                 }

//                 // ✅ File accepted by receiver (sender side now sends file)
//                 if (data.type === 'file-accept') {
//                     if (data.accepted) {
//                         console.log(`✅ Receiver accepted file transfer: ${data.to}`);
//                         const wsSender = activeConnections.get(data.to);
//                         if (wsSender) {
//                             // Call helper to send actual file data
//                             console.log(' *** 1 ****');
//                             await sendFileChunks(wsSender);
//                         }
//                     } else {
//                         console.log(`❌ Receiver declined file transfer.`);
//                     }
//                     return;
//                 }

//                 // 💾 Incoming file data (receiver saves)
//                 if (data.type === 'file-data') {
//                     const { fileName, chunk, isLast } = data;
//                     const filePath = path.join(TEMP_DIR, fileName);
//                     fs.appendFileSync(filePath, Buffer.from(chunk, 'base64'));
//                     if (isLast) {
//                         console.log(`✅ File saved locally: ${filePath}`);
//                     }
//                     return;
//                 }

//             } catch (err) {
//                 console.error('❌ Invalid message format or processing error:', err);
//             }
//         });

//         ws.on('close', () => {
//             for (const [id, socket] of activeConnections) {
//                 if (socket === ws) {
//                     activeConnections.delete(id);
//                     console.log(`Peer disconnected: ${id}`);
//                 }
//             }
//         });
//     });

//     process.on('SIGINT', () => {
//         console.log('\n🛑 Closing WebSocket server...');
//         for (const [, ws] of activeConnections) ws.close();
//         if (wss) wss.close();
//         process.exit(0);
//     });

//     return wss;
// }

// // 🔗 Connect to a discovered peer
// export function connectToPeer(peerId) {
//     const peers = getPeers();
//     const peer = peers.find(p => p.id === peerId);
//     if (!peer) throw new Error('Peer not found');

//     const url = `ws://${peer.ip}:${peer.port}`;
//     const ws = new websocket(url);

//     return new Promise((resolve, reject) => {
//         ws.on('open', () => {
//             console.log(`✅ Connected to peer: ${peerId} at ${url}`);
//             activeConnections.set(peerId, ws);
//             ws.send(JSON.stringify({ type: 'register', id: peerId }));
//             resolve(ws);
//         });

//         ws.on('message', async (msg) => {
//             try {
//                 const data = JSON.parse(msg);
//                 console.log('📨 Received message from peer:', data.type);

//                 // if (data.type === 'file-accept') {
//                 //     if (data.accepted) {
//                 //         console.log(`✅ File offer accepted by ${peerId}`);
//                 //         console.log(' *** 2 **** ');
//                 //         console.log('File to send:', data.files.map(f => f.name))
//                 //         await sendFileChunks(ws, data.files.map(f => f.name)); // start sending file chunks
//                 //     } else {
//                 //         console.log(`❌ File offer declined by ${peerId}`);
//                 //     }
//                 // }

//                 if (data.type === 'file-accept') {
//                     // Todo: we need to get the file name to send and then pass to sendFileChunks, ot we can send all the files available in Temp folder as the files to be sent are stored in the Temp folder already.
//                     if (data.accepted) {
//                         console.log(`✅ File offer accepted by ${peerId}`);
//                         console.log(' *** 2 **** ');
//                         console.log('Data received:', data);
//                         // 🗂️ Suppose you already have stored which file(s) were offered earlier:
//                         const offeredFiles = data.files.map(f => f.name); // e.g. ['SmallFile.txt']

//                         console.log('Offered files to send:', offeredFiles);
//                         if (!offeredFiles || offeredFiles.length === 0) {
//                             console.error('No offered files found for this peer.');
//                             return;
//                         }

//                         const fileName = offeredFiles[0]; // take the first file
//                         console.log('Sending file:', fileName);

//                         await sendFileChunks(ws, fileName); // send that file
//                     } else {
//                         console.log(`❌ File offer declined by ${peerId}`);
//                     }
//                 }

//             } catch (err) {
//                 console.error('❌ Failed to parse message from peer:', err);
//             }
//         });

//         ws.on('error', (err) => {
//             console.error(`❌ Connection error with peer ${peerId}:`, err);
//             reject(err);
//         });

//         ws.on('close', () => {
//             activeConnections.delete(peerId);
//             console.log(`Peer ${peerId} disconnected`);
//         });
//     });
// }

// // 📤 Send a file offer to a peer
// export function sendFileOffer(peerId, files, deviceName) {
//     const ws = activeConnections.get(peerId);
//     if (!ws || ws.readyState !== websocket.OPEN) {
//         throw new Error('Peer not connected or socket closed');
//     }

//     ws.send(JSON.stringify({
//         type: 'file-offer',
//         from: deviceName,
//         files: files.map(f => ({
//             name: f.name,
//             size: f.size,
//             type: f.type
//         }))
//     }));
// }

// // 📦 Helper to send file chunks (sender side)
// async function sendFileChunks(ws) {
//     const filePath = path.join(TEMP_DIR, fileName); // sample file
//     const CHUNK_SIZE = 64 * 1024; // 64KB per chunk

//     const fileStream = fs.createReadStream(filePath, { highWaterMark: CHUNK_SIZE });
//     const fileName = path.basename(filePath);

//     console.log(`🚀 Sending file: ${fileName}`);

//     for await (const chunk of fileStream) {
//         ws.send(JSON.stringify({
//             type: 'file-data',
//             fileName,
//             chunk: chunk.toString('base64'),
//             isLast: false
//         }));
//     }

//     // Send final signal
//     ws.send(JSON.stringify({
//         type: 'file-data',
//         fileName,
//         chunk: '',
//         isLast: true
//     }));

//     console.log(`✅ File transfer completed for ${fileName}`);
// }

// // 📢 Optional: Broadcast helper
// export function broadcastMessage(senderId, message) {
//     for (const [id, ws] of activeConnections) {
//         if (id !== senderId && ws.readyState === websocket.OPEN) {
//             ws.send(JSON.stringify(message));
//         }
//     }
// }

// // 📩 Notify a specific peer
// export function notifyPeer(peerId, message) {
//     const ws = activeConnections.get(peerId);
//     if (ws && ws.readyState === websocket.OPEN) {
//         ws.send(JSON.stringify(message));
//     }
// }


import websocket, { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { getPeers } from './udpDiscovery.js';
import { ensureTempDir } from './fileServices.js';

let wss;
const activeConnections = new Map(); // peerId → ws

// 📁 Define directories
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const TEMP_DIR = path.join(UPLOADS_DIR, 'temp');
const DOWNLOADS_DIR = path.join(UPLOADS_DIR, 'downloads');

// ✅ Ensure downloads directory exists
function ensureDownloadsDir() {
    if (!fs.existsSync(DOWNLOADS_DIR)) {
        fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
        console.log('📁 Created downloads directory:', DOWNLOADS_DIR);
    }
}

// 🟢 Start WebSocket server
export function startWebSocketServer(server) {
    if (wss) {
        console.log('WebSocket server already running.');
        return wss;
    }

    ensureTempDir();
    ensureDownloadsDir();
    wss = new WebSocketServer({ server });
    console.log('✅ WebSocket server started.');

    wss.on('connection', (ws, req) => {
        console.log('🔗 New WebSocket connection from:', req.socket.remoteAddress);

        ws.on('message', async (msg) => {
            try {
                const data = JSON.parse(msg);
                console.log('📨 Received message:', data.type);

                // 🪪 Peer registration
                if (data.type === 'register') {
                    activeConnections.set(data.id, ws);
                    console.log(`Peer registered: ${data.id}`);
                    return;
                }

                // 📁 File offer received (receiver side)
                if (data.type === 'file-offer') {
                    console.log(`📁 File offer from ${data.from}:`, data.files.map(f => f.name));

                    // Auto-accept for now
                    ws.send(JSON.stringify({
                        type: 'file-accept',
                        to: data.from,
                        accepted: true
                    }));
                    console.log('✅ Auto-accepted file offer');
                    return;
                }

                // ✅ File accepted by receiver (sender side now sends files)
                if (data.type === 'file-accept') {
                    if (data.accepted) {
                        console.log(`✅ Receiver accepted file transfer: ${data.to}`);
                        const wsSender = activeConnections.get(data.to);
                        if (wsSender) {
                            console.log('🚀 Sending all files from temp folder...');
                            await sendFileChunks(wsSender); // send all files dynamically
                        }
                    } else {
                        console.log(`❌ Receiver declined file transfer.`);
                    }
                    return;
                }

                // 💾 Incoming file data (receiver saves into downloads folder)
                if (data.type === 'file-data') {
                    const { fileName, chunk, isLast } = data;
                    const filePath = path.join(DOWNLOADS_DIR, fileName);

                    if (chunk) {
                        fs.appendFileSync(filePath, Buffer.from(chunk, 'base64'));
                    }

                    if (isLast) {
                        console.log(`✅ File received and saved: ${filePath}`);
                    }
                    return;
                }

            } catch (err) {
                console.error('❌ Invalid message format or processing error:', err);
            }
        });

        ws.on('close', () => {
            for (const [id, socket] of activeConnections) {
                if (socket === ws) {
                    activeConnections.delete(id);
                    console.log(`Peer disconnected: ${id}`);
                }
            }
        });
    });

    process.on('SIGINT', () => {
        console.log('\n🛑 Closing WebSocket server...');
        for (const [, ws] of activeConnections) ws.close();
        if (wss) wss.close();
        process.exit(0);
    });

    return wss;
}

// 🔗 Connect to a discovered peer
export function connectToPeer(peerId) {
    const peers = getPeers();
    const peer = peers.find(p => p.id === peerId);
    if (!peer) throw new Error('Peer not found');

    const url = `ws://${peer.ip}:${peer.port}`;
    const ws = new websocket(url);

    return new Promise((resolve, reject) => {
        ws.on('open', () => {
            console.log(`✅ Connected to peer: ${peerId} at ${url}`);
            activeConnections.set(peerId, ws);
            ws.send(JSON.stringify({ type: 'register', id: peerId }));
            resolve(ws);
        });

        ws.on('message', async (msg) => {
            try {
                const data = JSON.parse(msg);
                console.log('📨 Received message from peer:', data.type);

                // When receiver accepts, send all files in temp
                if (data.type === 'file-accept' && data.accepted) {
                    console.log(`✅ File offer accepted by ${peerId}`);
                    console.log('🚀 Sending all files from temp folder...');
                    await sendFileChunks(ws);
                } else if (data.type === 'file-accept' && !data.accepted) {
                    console.log(`❌ File offer declined by ${peerId}`);
                }

            } catch (err) {
                console.error('❌ Failed to parse message from peer:', err);
            }
        });

        ws.on('error', (err) => {
            console.error(`❌ Connection error with peer ${peerId}:`, err);
            reject(err);
        });

        ws.on('close', () => {
            activeConnections.delete(peerId);
            console.log(`Peer ${peerId} disconnected`);
        });
    });
}

// 📤 Send a file offer to a peer
export function sendFileOffer(peerId, files, deviceName) {
    const ws = activeConnections.get(peerId);
    if (!ws || ws.readyState !== websocket.OPEN) {
        throw new Error('Peer not connected or socket closed');
    }

    ws.send(JSON.stringify({
        type: 'file-offer',
        from: deviceName,
        files: files.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type
        }))
    }));
}

// 📦 Helper to send all files from TEMP_DIR (sender side)
async function sendFileChunks(ws) {
    const CHUNK_SIZE = 64 * 1024; // 64KB
    const files = fs.readdirSync(TEMP_DIR);

    if (files.length === 0) {
        console.log('⚠️ No files found in temp folder to send.');
        return;
    }

    console.log(`🚀 Sending ${files.length} file(s) from temp folder...`);

    for (const fileName of files) {
        const filePath = path.join(TEMP_DIR, fileName);
        const fileStream = fs.createReadStream(filePath, { highWaterMark: CHUNK_SIZE });

        console.log(`📤 Sending file: ${fileName}`);

        for await (const chunk of fileStream) {
            ws.send(JSON.stringify({
                type: 'file-data',
                fileName,
                chunk: chunk.toString('base64'),
                isLast: false
            }));
        }

        // Mark end of file
        ws.send(JSON.stringify({
            type: 'file-data',
            fileName,
            chunk: '',
            isLast: true
        }));

        console.log(`✅ Completed sending file: ${fileName}`);
    }

    console.log('🏁 All files sent successfully.');

    // 🧹 Optional cleanup
    for (const file of files) {
        fs.unlinkSync(path.join(TEMP_DIR, file));
    }
    console.log('🧹 Temp folder cleared after sending.');
}

// 📢 Optional: Broadcast helper
export function broadcastMessage(senderId, message) {
    for (const [id, ws] of activeConnections) {
        if (id !== senderId && ws.readyState === websocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
}

// 📩 Notify a specific peer
export function notifyPeer(peerId, message) {
    const ws = activeConnections.get(peerId);
    if (ws && ws.readyState === websocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}
