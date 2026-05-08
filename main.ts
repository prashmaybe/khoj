import { app, BrowserWindow, ipcMain, BrowserView } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let browserViews: Map<string, BrowserView> = new Map();
let activeViewId: string | null = null;

function createWindow(): void {
  // `process.cwd()` is not stable (depends on how Electron is launched).
  // Resolve preload relative to the compiled main process file.
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload script path:', preloadPath);
  console.log('Preload script exists:', require('fs').existsSync(preloadPath));
  
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: preloadPath,
    },
  });

  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('app.isPackaged:', app.isPackaged);
  
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    console.log('Running in development mode, loading from webpack dev server');
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    console.log('Running in production mode, loading from dist folder');
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();
});

function setupIpcHandlers() {
  ipcMain.handle('create-tab', async (_, tabId: string, url: string) => {
    if (!mainWindow) return null;
    
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      }
    });
    
    browserViews.set(tabId, view);
    
    view.webContents.on('did-start-loading', () => {
      mainWindow?.webContents.send('tab-loading', tabId);
    });
    
    view.webContents.on('did-finish-load', () => {
      mainWindow?.webContents.send('tab-loaded', tabId, view.webContents.getURL());
    });
    
    view.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      mainWindow?.webContents.send('tab-failed', tabId, errorCode, errorDescription);
    });
    
    await view.webContents.loadURL(url);
    
    if (!activeViewId) {
      activeViewId = tabId;
      mainWindow.addBrowserView(view);
      view.setBounds({ x: 0, y: 100, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height - 100 });
    }
    
    return tabId;
  });
  
  ipcMain.handle('navigate-tab', async (_, tabId: string, url: string) => {
    const view = browserViews.get(tabId);
    if (view) {
      await view.webContents.loadURL(url);
    }
  });
  
  ipcMain.handle('switch-tab', (_, tabId: string) => {
    if (!mainWindow) return;
    
    const currentView = browserViews.get(activeViewId!);
    if (currentView) {
      mainWindow.removeBrowserView(currentView);
    }
    
    const newView = browserViews.get(tabId);
    if (newView) {
      activeViewId = tabId;
      mainWindow.addBrowserView(newView);
      newView.setBounds({ x: 0, y: 100, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height - 100 });
    }
  });
  
  ipcMain.handle('close-tab', (_, tabId: string) => {
    const view = browserViews.get(tabId);
    if (view) {
      view.webContents.close();
      browserViews.delete(tabId);
      
      if (activeViewId === tabId) {
        activeViewId = null;
        const remainingTabs = Array.from(browserViews.keys());
        if (remainingTabs.length > 0) {
          const newActiveTab = remainingTabs[0];
          const newView = browserViews.get(newActiveTab);
          if (newView && mainWindow) {
            activeViewId = newActiveTab;
            mainWindow.addBrowserView(newView);
            newView.setBounds({ x: 0, y: 100, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height - 100 });
          }
        }
      }
    }
  });
  
  ipcMain.handle('go-back', (_, tabId: string) => {
    const view = browserViews.get(tabId);
    if (view && view.webContents.canGoBack()) {
      view.webContents.goBack();
    }
  });
  
  ipcMain.handle('go-forward', (_, tabId: string) => {
    const view = browserViews.get(tabId);
    if (view && view.webContents.canGoForward()) {
      view.webContents.goForward();
    }
  });
  
  ipcMain.handle('reload', (_, tabId: string) => {
    const view = browserViews.get(tabId);
    if (view) {
      view.webContents.reload();
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
