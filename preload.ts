import { contextBridge, ipcRenderer } from 'electron';

console.log('Preload script is loading...');

contextBridge.exposeInMainWorld('electronAPI', {
  createTab: (tabId: string, url: string) => ipcRenderer.invoke('create-tab', tabId, url),
  navigateTab: (tabId: string, url: string) => ipcRenderer.invoke('navigate-tab', tabId, url),
  switchTab: (tabId: string) => ipcRenderer.invoke('switch-tab', tabId),
  closeTab: (tabId: string) => ipcRenderer.invoke('close-tab', tabId),
  goBack: (tabId: string) => ipcRenderer.invoke('go-back', tabId),
  goForward: (tabId: string) => ipcRenderer.invoke('go-forward', tabId),
  reload: (tabId: string) => ipcRenderer.invoke('reload', tabId),
  toggleDevTools: () => ipcRenderer.invoke('toggle-devtools'),
  
  onTabLoading: (callback: (tabId: string) => void) => {
    ipcRenderer.on('tab-loading', (_, tabId) => callback(tabId));
  },
  onTabLoaded: (callback: (tabId: string, url: string) => void) => {
    ipcRenderer.on('tab-loaded', (_, tabId, url) => callback(tabId, url));
  },
  onTabFailed: (callback: (tabId: string, errorCode: number, errorDescription: string) => void) => {
    ipcRenderer.on('tab-failed', (_, tabId, errorCode, errorDescription) => callback(tabId, errorCode, errorDescription));
  },
  onTabTitleUpdated: (callback: (tabId: string, title: string) => void) => {
    ipcRenderer.on('tab-title-updated', (_, tabId, title) => callback(tabId, title));
  },
  onTabFaviconUpdated: (callback: (tabId: string, faviconUrl: string | null) => void) => {
    ipcRenderer.on('tab-favicon-updated', (_, tabId, faviconUrl) => callback(tabId, faviconUrl));
  },
  
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

declare global {
  interface Window {
    electronAPI: {
      createTab: (tabId: string, url: string) => Promise<string | null>;
      navigateTab: (tabId: string, url: string) => Promise<void>;
      switchTab: (tabId: string) => Promise<void>;
      closeTab: (tabId: string) => Promise<void>;
      goBack: (tabId: string) => Promise<void>;
      goForward: (tabId: string) => Promise<void>;
      reload: (tabId: string) => Promise<void>;
      toggleDevTools: () => Promise<void>;
      
      onTabLoading: (callback: (tabId: string) => void) => void;
      onTabLoaded: (callback: (tabId: string, url: string) => void) => void;
      onTabFailed: (callback: (tabId: string, errorCode: number, errorDescription: string) => void) => void;
      onTabTitleUpdated: (callback: (tabId: string, title: string) => void) => void;
      onTabFaviconUpdated: (callback: (tabId: string, faviconUrl: string | null) => void) => void;
      
      removeAllListeners: (channel: string) => void;
    };
  }
}
