import { contextBridge, ipcRenderer } from 'electron';

// Expose secure APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
    maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
    closeWindow: () => ipcRenderer.invoke('window-close'),
    
    // File operations
    showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
    
    // External links
    openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
    
    // Menu actions (receive from main process)
    onNewTab: (callback: () => void) => ipcRenderer.on('new-tab', callback),
    onCloseTab: (callback: () => void) => ipcRenderer.on('close-tab', callback),
    onPrintPage: (callback: () => void) => ipcRenderer.on('print-page', callback),
    onFind: (callback: () => void) => ipcRenderer.on('find', callback),
    onFindNext: (callback: () => void) => ipcRenderer.on('find-next', callback),
    onFindPrevious: (callback: () => void) => ipcRenderer.on('find-previous', callback),
    onReload: (callback: () => void) => ipcRenderer.on('reload', callback),
    onForceReload: (callback: () => void) => ipcRenderer.on('force-reload', callback),
    
    // Window state events
    onWindowMaximized: (callback: () => void) => ipcRenderer.on('window-maximized', callback),
    onWindowUnmaximized: (callback: () => void) => ipcRenderer.on('window-unmaximized', callback),
    onWindowFocused: (callback: () => void) => ipcRenderer.on('window-focused', callback),
    onWindowBlurred: (callback: () => void) => ipcRenderer.on('window-blurred', callback),
    onZoomReset: (callback: () => void) => ipcRenderer.on('zoom-reset', callback),
    onZoomIn: (callback: () => void) => ipcRenderer.on('zoom-in', callback),
    onZoomOut: (callback: () => void) => ipcRenderer.on('zoom-out', callback),
    onToggleDevTools: (callback: () => void) => ipcRenderer.on('toggle-dev-tools', callback),
    onGoBack: (callback: () => void) => ipcRenderer.on('go-back', callback),
    onGoForward: (callback: () => void) => ipcRenderer.on('go-forward', callback),
    onShowHistory: (callback: () => void) => ipcRenderer.on('show-history', callback),
    onShowDownloads: (callback: () => void) => ipcRenderer.on('show-downloads', callback),
    onBookmarkPage: (callback: () => void) => ipcRenderer.on('bookmark-page', callback),
    onShowBookmarks: (callback: () => void) => ipcRenderer.on('show-bookmarks', callback),
    onImportBookmarks: (callback: (filePath: string) => void) => ipcRenderer.on('import-bookmarks', (_, filePath) => callback(filePath)),
    onExportBookmarks: (callback: (filePath: string) => void) => ipcRenderer.on('export-bookmarks', (_, filePath) => callback(filePath)),
    onOpenUrlInNewTab: (callback: (url: string) => void) => ipcRenderer.on('open-url-in-new-tab', (_, url) => callback(url)),
    
    // Remove listeners
    removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel)
});

// Type definitions for the exposed API
declare global {
    interface Window {
        electronAPI: {
            minimizeWindow: () => Promise<void>;
            maximizeWindow: () => Promise<void>;
            closeWindow: () => Promise<void>;
            showSaveDialog: (options: any) => Promise<any>;
            showOpenDialog: (options: any) => Promise<any>;
            readFile: (filePath: string) => Promise<string>;
            writeFile: (filePath: string, content: string) => Promise<void>;
            openExternal: (url: string) => Promise<void>;
            onNewTab: (callback: () => void) => void;
            onCloseTab: (callback: () => void) => void;
            onPrintPage: (callback: () => void) => void;
            onFind: (callback: () => void) => void;
            onFindNext: (callback: () => void) => void;
            onFindPrevious: (callback: () => void) => void;
            onReload: (callback: () => void) => void;
            onForceReload: (callback: () => void) => void;
            onZoomReset: (callback: () => void) => void;
            onZoomIn: (callback: () => void) => void;
            onZoomOut: (callback: () => void) => void;
            onToggleDevTools: (callback: () => void) => void;
            onGoBack: (callback: () => void) => void;
            onGoForward: (callback: () => void) => void;
            onShowHistory: (callback: () => void) => void;
            onShowDownloads: (callback: () => void) => void;
            onBookmarkPage: (callback: () => void) => void;
            onShowBookmarks: (callback: () => void) => void;
            onImportBookmarks: (callback: (filePath: string) => void) => void;
            onExportBookmarks: (callback: (filePath: string) => void) => void;
            onOpenUrlInNewTab: (callback: (url: string) => void) => void;
            onWindowMaximized: (callback: () => void) => void;
            onWindowUnmaximized: (callback: () => void) => void;
            onWindowFocused: (callback: () => void) => void;
            onWindowBlurred: (callback: () => void) => void;
            removeAllListeners: (channel: string) => void;
        };
    }
}
