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
        .sub { color: rgba(0,0,0,.6); font-size: 14px; margin-bottom: 32px; }
        .hint { color: rgba(0,0,0,.45); font-size: 12px; margin-top: 14px; }
        .pill { display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 999px; border: 1px solid rgba(0,0,0,.12); background: #f8f9fa; margin-bottom: 32px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; background: #1a73e8; opacity: .9; }
        
        .search-container { width: 100%; max-width: 584px; margin: 0 auto 32px; }
        .search-box {
          width: 100%;
          height: 44px;
          border: 1px solid #dfe1e5;
          border-radius: 24px;
          padding: 0 16px 0 44px;
          font-size: 16px;
          outline: none;
          background: #fff;
          box-shadow: 0 1px 6px rgba(32,33,36,.28);
          transition: box-shadow 0.2s ease;
        }
        .search-box:hover, .search-box:focus {
          box-shadow: 0 1px 6px rgba(32,33,36,.38);
          border-color: rgba(223,225,229,0);
        }
        .search-box:focus {
          box-shadow: 0 1px 6px rgba(32,33,36,.48);
        }
        .search-wrapper { position: relative; }
        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          opacity: 0.5;
          pointer-events: none;
        }
        .search-icon::before {
          content: "🔍";
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="card">
          <div class="logo">Khoj</div>
          <div class="sub">Search the web or enter a URL</div>
          
          <div class="search-container">
            <div class="search-wrapper">
              <span class="search-icon"></span>
              <input 
                type="text" 
                class="search-box" 
                id="searchInput"
                placeholder="Search Google or type a URL"
                autocomplete="off"
                autofocus
              />
            </div>
          </div>
          
          <div class="pill"><span class="dot"></span><span>New Tab</span></div>
          <div class="hint">Tip: Click the Home button anytime to come back here.</div>
        </div>
      </div>
      
      <script>
        const searchInput = document.getElementById('searchInput');
        
        function isSearchQuery(input) {
          const trimmed = input.trim();
          
          // If it starts with http:// or https://, it's a URL
          if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return false;
          }
          
          // If it contains spaces, it's likely a search query
          if (trimmed.includes(' ')) {
            return true;
          }
          
          // Check if it's a valid domain format (has at least one dot and no spaces)
          const domainRegex = /^[a-zA-Z0-9-]+\\.[a-zA-Z]{2,}$/;
          if (domainRegex.test(trimmed)) {
            return false;
          }
          
          // If it doesn't have a dot, it's likely a search query
          if (!trimmed.includes('.')) {
            return true;
          }
          
          // Default to treating as search query for safety
          return true;
        }
        
        function createGoogleSearchUrl(query) {
          const encodedQuery = encodeURIComponent(query.trim());
          return \`https://www.google.com/search?q=\${encodedQuery}\`;
        }
        
        function formatUrl(input) {
          let formattedUrl = input.trim();
          if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
            formattedUrl = 'https://' + formattedUrl;
          }
          return formattedUrl;
        }
        
        function handleSearch() {
          const query = searchInput.value.trim();
          if (!query) return;
          
          let targetUrl;
          if (isSearchQuery(query)) {
            targetUrl = createGoogleSearchUrl(query);
          } else {
            targetUrl = formatUrl(query);
          }
          
          // Send message to parent window to navigate
          if (window.parent && window.parent.postMessage) {
            window.parent.postMessage({
              type: 'navigate',
              url: targetUrl
            }, '*');
          }
        }
        
        searchInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            handleSearch();
          }
        });
        
        // Focus the search input when page loads
        searchInput.focus();
      </script>
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
