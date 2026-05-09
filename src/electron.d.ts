export interface ElectronAPI {
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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
