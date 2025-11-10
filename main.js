const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

let mainWindow;
let backendProcess;

const isDev = !app.isPackaged;

function getBackendPath() {
  const unpackedPath = path.join(process.resourcesPath, 'backend', 'index.js');
  const devPath = path.join(__dirname, 'backend', 'index.js');
  return fs.existsSync(unpackedPath) ? unpackedPath : devPath;
}

function startBackend() {
  const backendPath = getBackendPath();
  const nodeBinary = isDev
    ? 'node'
    : path.join(process.resourcesPath, 'backend-node', 'node.exe');

  console.log('🚀 Starting backend with:', nodeBinary);
  console.log('📁 Backend path:', backendPath);

  backendProcess = spawn(nodeBinary, [backendPath], {
    cwd: path.dirname(backendPath),
    env: { ...process.env, PORT: '5000', NODE_ENV: isDev ? 'development' : 'production' },
    stdio: 'inherit'
  });

  backendProcess.on('exit', (code) => {
    console.log(`⚙️ Backend process exited with code ${code}`);
  });

  backendProcess.on('error', (err) => {
    console.error('❌ Failed to start backend process:', err);
  });
}

// 🕐 Wait for backend to start listening before loading frontend
function waitForBackend(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      http.get(url, () => resolve(true)).on('error', () => {
        if (Date.now() - start < timeout) {
          setTimeout(check, 500);
        } else {
          reject(new Error('Backend did not start in time'));
        }
      });
    };

    check();
  });
}

function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    try {
      backendProcess.kill();
      console.log('🛑 Backend process stopped');
    } catch (err) {
      console.error('Error while killing backend process:', err);
    }
  }
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    const frontendPath = path.join(__dirname, 'frontend', 'build', 'index.html');
    console.log('🌐 Loading frontend from:', frontendPath);

    try {
      await waitForBackend('http://localhost:5000');
      console.log('✅ Backend is ready, loading frontend...');
    } catch (err) {
      console.warn('⚠️ Backend not responding in time:', err.message);
    }

    mainWindow.loadFile(frontendPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  startBackend();
  await createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', stopBackend);

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
