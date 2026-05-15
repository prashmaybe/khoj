"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let mainWindow = null;
let isDev = false;
function getPreloadPath() {
    return path.join(__dirname, 'preload.js');
}
function loadRenderer(win, incognito = false) {
    if (isDev) {
        win.loadURL(incognito ? 'http://localhost:8080#incognito' : 'http://localhost:8080');
        return;
    }
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (incognito) {
        win.loadFile(indexPath, { hash: 'incognito' });
    }
    else {
        win.loadFile(indexPath);
    }
}
function createBrowserWindow(incognito = false) {
    const preloadPath = getPreloadPath();
    const win = new electron_1.BrowserWindow({
        height: 800,
        width: 1200,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            webviewTag: true,
            preload: preloadPath,
        },
    });
    win.webContents.on('context-menu', (event) => {
        event.preventDefault();
    });
    if (!isDev) {
        win.webContents.on('before-input-event', (event, input) => {
            if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
                event.preventDefault();
            }
        });
    }
    loadRenderer(win, incognito);
    if (isDev && !incognito) {
        win.webContents.openDevTools({ mode: 'detach' });
    }
    win.on('closed', () => {
        if (win === mainWindow) {
            mainWindow = null;
        }
    });
    return win;
}
function setupDownloadHandler(electronSession) {
    electronSession.on('will-download', (_event, item) => {
        const downloadId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const filename = item.getFilename();
        const downloadsDir = electron_1.app.getPath('downloads');
        const savePath = path.join(downloadsDir, filename);
        let finalPath = savePath;
        if (fs.existsSync(finalPath)) {
            const ext = path.extname(filename);
            const base = path.basename(filename, ext);
            finalPath = path.join(downloadsDir, `${base} (${Date.now()})${ext}`);
        }
        item.setSavePath(finalPath);
        mainWindow?.webContents.send('download-started', {
            id: downloadId,
            filename,
            url: item.getURL(),
            filePath: finalPath,
        });
        item.on('updated', (_evt, state) => {
            if (state !== 'progressing')
                return;
            const totalBytes = item.getTotalBytes();
            const receivedBytes = item.getReceivedBytes();
            const progress = totalBytes > 0 ? Math.round((receivedBytes / totalBytes) * 100) : 0;
            mainWindow?.webContents.send('download-progress', {
                id: downloadId,
                filename,
                progress,
                receivedBytes,
                totalBytes,
                state: 'progressing',
            });
        });
        item.once('done', (_evt, state) => {
            if (state === 'completed') {
                mainWindow?.webContents.send('download-completed', {
                    id: downloadId,
                    filename,
                    path: item.getSavePath(),
                    state: 'completed',
                });
                return;
            }
            mainWindow?.webContents.send('download-failed', {
                id: downloadId,
                filename,
                state,
            });
        });
    });
}
function setupIpcHandlers() {
    electron_1.ipcMain.handle('create-window', () => {
        createBrowserWindow(false);
    });
    electron_1.ipcMain.handle('create-incognito-window', () => {
        createBrowserWindow(true);
    });
    electron_1.ipcMain.handle('close-window', (event) => {
        const win = electron_1.BrowserWindow.fromWebContents(event.sender);
        win?.close();
    });
    electron_1.ipcMain.handle('open-pdf-file', async () => {
        const win = electron_1.BrowserWindow.getFocusedWindow() ?? mainWindow;
        if (!win)
            return null;
        const result = await electron_1.dialog.showOpenDialog(win, {
            properties: ['openFile'],
            filters: [{ name: 'PDF', extensions: ['pdf'] }],
        });
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        const filePath = result.filePaths[0];
        return {
            filePath,
            fileUrl: `file://${filePath.replace(/\\/g, '/')}`,
            name: path.basename(filePath),
        };
    });
    electron_1.ipcMain.handle('clear-browsing-data', async (_event, options) => {
        const storages = [];
        if (options.cookies)
            storages.push('cookies');
        if (options.cache)
            storages.push('cachestorage', 'shadercache', 'serviceworkers');
        if (options.localStorage || options.sessionStorage) {
            storages.push('localstorage', 'indexdb', 'websql');
        }
        if (options.passwords)
            storages.push('passwords');
        const removalOptions = {
            storages: storages.length > 0 ? storages : ['cookies', 'cachestorage'],
        };
        if (options.timeRange && options.timeRange !== 'allTime') {
            const now = Date.now();
            const ranges = {
                lastHour: 60 * 60 * 1000,
                lastDay: 24 * 60 * 60 * 1000,
                lastWeek: 7 * 24 * 60 * 60 * 1000,
                lastMonth: 30 * 24 * 60 * 60 * 1000,
            };
            const delta = ranges[options.timeRange];
            if (delta) {
                removalOptions.since = now - delta;
            }
        }
        await electron_1.session.defaultSession.clearStorageData(removalOptions);
        try {
            await electron_1.session.fromPartition('incognito').clearStorageData(removalOptions);
        }
        catch {
            // incognito partition may not exist yet
        }
        if (options.browsingHistory) {
            await electron_1.session.defaultSession.clearStorageData({ storages: ['indexdb', 'localstorage'] });
        }
    });
}
electron_1.app.whenReady().then(() => {
    isDev = process.env.NODE_ENV === 'development' || !electron_1.app.isPackaged;
    electron_1.Menu.setApplicationMenu(null);
    setupDownloadHandler(electron_1.session.defaultSession);
    setupDownloadHandler(electron_1.session.fromPartition('incognito'));
    setupIpcHandlers();
    if (process.platform === 'win32') {
        electron_1.app.setAsDefaultProtocolClient('khoj');
    }
    if (!isDev && process.argv.length > 1) {
        const firstArg = process.argv[1];
        if (firstArg.startsWith('khoj://')) {
            const url = firstArg;
            if (mainWindow) {
                mainWindow.loadURL(url);
            }
        }
    }
    mainWindow = createBrowserWindow(false);
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createBrowserWindow(false);
    }
});
