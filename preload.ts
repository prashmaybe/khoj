import { contextBridge, ipcRenderer } from 'electron';

export interface DownloadEventPayload {
  id: string;
  filename: string;
  url?: string;
  filePath?: string;
  path?: string;
  progress?: number;
  receivedBytes?: number;
  totalBytes?: number;
  state?: string;
}

export interface OpenPdfFileResult {
  filePath: string;
  fileUrl: string;
  name: string;
}

export interface ClearBrowsingDataOptions {
  browsingHistory?: boolean;
  cookies?: boolean;
  cache?: boolean;
  localStorage?: boolean;
  sessionStorage?: boolean;
  passwords?: boolean;
  autofillData?: boolean;
  timeRange?: string;
}

contextBridge.exposeInMainWorld('electronAPI', {
  createWindow: () => ipcRenderer.invoke('create-window'),
  createIncognitoWindow: () => ipcRenderer.invoke('create-incognito-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  openPdfFile: (): Promise<OpenPdfFileResult | null> => ipcRenderer.invoke('open-pdf-file'),
  clearBrowsingData: (options: ClearBrowsingDataOptions) =>
    ipcRenderer.invoke('clear-browsing-data', options),

  onDownloadStarted: (callback: (data: DownloadEventPayload) => void) => {
    ipcRenderer.on('download-started', (_event, data) => callback(data));
  },
  onDownloadProgress: (callback: (data: DownloadEventPayload) => void) => {
    ipcRenderer.on('download-progress', (_event, data) => callback(data));
  },
  onDownloadCompleted: (callback: (data: DownloadEventPayload) => void) => {
    ipcRenderer.on('download-completed', (_event, data) => callback(data));
  },
  onDownloadFailed: (callback: (data: DownloadEventPayload) => void) => {
    ipcRenderer.on('download-failed', (_event, data) => callback(data));
  },

  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
