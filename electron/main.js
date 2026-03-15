const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;
let pendingProtocolUrl = extractProtocolUrl(process.argv);

function extractProtocolUrl(argv) {
    return argv.find((arg) => typeof arg === 'string' && arg.startsWith('blinkpass://')) ?? null;
}

function registerProtocolClient() {
    if (process.defaultApp && process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('blinkpass', process.execPath, [path.resolve(process.argv[1])]);
        return;
    }

    app.setAsDefaultProtocolClient('blinkpass');
}

function focusMainWindow() {
    if (!mainWindow || mainWindow.isDestroyed()) {
        return;
    }

    if (mainWindow.isMinimized()) {
        mainWindow.restore();
    }

    mainWindow.focus();
}

function dispatchProtocolUrl(protocolUrl) {
    pendingProtocolUrl = protocolUrl;

    if (!mainWindow || mainWindow.isDestroyed()) {
        return;
    }

    mainWindow.webContents.send('blinkpass:protocol-url', protocolUrl);
    focusMainWindow();
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
    app.quit();
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.loadFile(
        path.join(__dirname, '..', 'dist', 'BlinkPassFront', 'browser', 'index.html')
    );
}

if (gotSingleInstanceLock) {
    app.on('second-instance', (_event, argv) => {
        const protocolUrl = extractProtocolUrl(argv);

        if (protocolUrl) {
            dispatchProtocolUrl(protocolUrl);
        } else {
            focusMainWindow();
        }
    });

    app.on('open-url', (event, protocolUrl) => {
        event.preventDefault();
        dispatchProtocolUrl(protocolUrl);
    });

    ipcMain.handle('blinkpass:get-launch-protocol-url', () => {
        const protocolUrl = pendingProtocolUrl;
        pendingProtocolUrl = null;
        return protocolUrl;
    });

    app.whenReady().then(() => {
        registerProtocolClient();
        createWindow();
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
