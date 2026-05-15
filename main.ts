import { app, BrowserWindow, ipcMain, Menu, session, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let isDev = false;

function getPreloadPath(): string {
  return path.join(__dirname, 'preload.js');
}

function loadRenderer(win: BrowserWindow, incognito = false): void {
  if (isDev) {
    win.loadURL(incognito ? 'http://localhost:8080#incognito' : 'http://localhost:8080');
    return;
  }
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (incognito) {
    win.loadFile(indexPath, { hash: 'incognito' });
  } else {
    win.loadFile(indexPath);
  }
}

function createBrowserWindow(incognito = false): BrowserWindow {
  const preloadPath = getPreloadPath();
  const win = new BrowserWindow({
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

function setupDownloadHandler(electronSession: Electron.Session): void {
  electronSession.on('will-download', (_event, item) => {
    const downloadId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const filename = item.getFilename();
    const downloadsDir = app.getPath('downloads');
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
      if (state !== 'progressing') return;
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

function setupIpcHandlers(): void {
  ipcMain.handle('create-window', () => {
    createBrowserWindow(false);
  });

  ipcMain.handle('create-incognito-window', () => {
    createBrowserWindow(true);
  });

  ipcMain.handle('close-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.close();
  });

  ipcMain.handle('open-pdf-file', async () => {
    const win = BrowserWindow.getFocusedWindow() ?? mainWindow;
    if (!win) return null;

    const result = await dialog.showOpenDialog(win, {
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

  ipcMain.handle('clear-browsing-data', async (_event, options: {
    browsingHistory?: boolean;
    cookies?: boolean;
    cache?: boolean;
    localStorage?: boolean;
    sessionStorage?: boolean;
    passwords?: boolean;
    timeRange?: string;
  }) => {
    const storages: string[] = [];
    if (options.cookies) storages.push('cookies');
    if (options.cache) storages.push('cachestorage', 'shadercache', 'serviceworkers');
    if (options.localStorage || options.sessionStorage) {
      storages.push('localstorage', 'indexdb', 'websql');
    }
    if (options.passwords) storages.push('passwords');

    const removalOptions: Electron.ClearStorageDataOptions = {
      storages: storages.length > 0 ? (storages as Electron.ClearStorageDataOptions['storages']) : ['cookies', 'cachestorage'],
    };

    if (options.timeRange && options.timeRange !== 'allTime') {
      const now = Date.now();
      const ranges: Record<string, number> = {
        lastHour: 60 * 60 * 1000,
        lastDay: 24 * 60 * 60 * 1000,
        lastWeek: 7 * 24 * 60 * 60 * 1000,
        lastMonth: 30 * 24 * 60 * 60 * 1000,
      };
      const delta = ranges[options.timeRange];
      if (delta) {
        (removalOptions as Electron.ClearStorageDataOptions & { since?: number }).since = now - delta;
      }
    }

    await session.defaultSession.clearStorageData(removalOptions);
    try {
      await session.fromPartition('incognito').clearStorageData(removalOptions);
    } catch {
      // incognito partition may not exist yet
    }

    if (options.browsingHistory) {
      await session.defaultSession.clearStorageData({ storages: ['indexdb', 'localstorage'] });
    }
  });
}

app.whenReady().then(() => {
  isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  Menu.setApplicationMenu(null);
  setupDownloadHandler(session.defaultSession);
  setupDownloadHandler(session.fromPartition('incognito'));
  setupIpcHandlers();
  
  if (process.platform === 'win32') {
    app.setAsDefaultProtocolClient('khoj');
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createBrowserWindow(false);
  }
});
