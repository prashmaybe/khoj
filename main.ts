import { app, BrowserWindow, ipcMain, BrowserView } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let browserViews: Map<string, BrowserView> = new Map();
let activeViewId: string | null = null;

const HOME_ROUTE = 'khoj://home';
function getHomeDataUrl(): string {
  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>New Tab</title>
      <style>
        :root { color-scheme: light; }
        html, body { height: 100%; margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background: #ffffff; }
        .wrap { height: 100%; display: grid; place-items: center; }
        .card { width: min(720px, calc(100vw - 48px)); text-align: center; }
        .logo { font-size: 44px; font-weight: 700; letter-spacing: -0.02em; color: rgba(0,0,0,.82); margin-bottom: 18px; }
        .sub { color: rgba(0,0,0,.6); font-size: 14px; margin-bottom: 18px; }
        .hint { color: rgba(0,0,0,.45); font-size: 12px; margin-top: 14px; }
        .pill { display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 999px; border: 1px solid rgba(0,0,0,.12); background: #f8f9fa; }
        .dot { width: 10px; height: 10px; border-radius: 50%; background: #1a73e8; opacity: .9; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="card">
          <div class="logo">Khoj</div>
          <div class="sub">Search or type a URL in the address bar to get started.</div>
          <div class="pill"><span class="dot"></span><span>New Tab</span></div>
          <div class="hint">Tip: Click the Home button anytime to come back here.</div>
        </div>
      </div>
    </body>
  </html>`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

function toLoadableUrl(url: string): string {
  return url === HOME_ROUTE ? getHomeDataUrl() : url;
}

function toReportedUrl(url: string): string {
  return url.startsWith('data:text/html') ? HOME_ROUTE : url;
}

function updateActiveViewBounds(): void {
  if (!mainWindow || !activeViewId) return;
  const view = browserViews.get(activeViewId);
  if (!view) return;

  const { width, height } = mainWindow.getContentBounds();
  const topBarHeight = 100;
  view.setBounds({
    x: 0,
    y: topBarHeight,
    width,
    height: Math.max(0, height - topBarHeight),
  });
}

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

  // Keep BrowserView in sync with window size.
  mainWindow.on('resize', () => {
    updateActiveViewBounds();
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
    
    // Keep renderer tab strip (title + favicon) in sync with the page.
    view.webContents.on('page-title-updated', (_event, title) => {
      mainWindow?.webContents.send('tab-title-updated', tabId, title);
    });
    view.webContents.on('page-favicon-updated', (_event, favicons) => {
      const favicon = Array.isArray(favicons) && favicons.length > 0 ? favicons[0] : null;
      mainWindow?.webContents.send('tab-favicon-updated', tabId, favicon);
    });

    view.webContents.on('did-start-loading', () => {
      mainWindow?.webContents.send('tab-loading', tabId);
    });
    
    view.webContents.on('did-finish-load', () => {
      mainWindow?.webContents.send('tab-loaded', tabId, toReportedUrl(view.webContents.getURL()));
    });
    
    view.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      mainWindow?.webContents.send('tab-failed', tabId, errorCode, errorDescription);
    });
    
    await view.webContents.loadURL(toLoadableUrl(url));
    
    if (!activeViewId) {
      activeViewId = tabId;
      mainWindow.addBrowserView(view);
      updateActiveViewBounds();
    }
    
    return tabId;
  });
  
  ipcMain.handle('navigate-tab', async (_, tabId: string, url: string) => {
    const view = browserViews.get(tabId);
    if (view) {
      await view.webContents.loadURL(toLoadableUrl(url));
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
      updateActiveViewBounds();
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
            updateActiveViewBounds();
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
