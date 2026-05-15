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

export interface ElectronAPI {
  createWindow: () => Promise<void>;
  createIncognitoWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  openPdfFile: () => Promise<OpenPdfFileResult | null>;
  clearBrowsingData: (options: ClearBrowsingDataOptions) => Promise<void>;

  onDownloadStarted: (callback: (data: DownloadEventPayload) => void) => void;
  onDownloadProgress: (callback: (data: DownloadEventPayload) => void) => void;
  onDownloadCompleted: (callback: (data: DownloadEventPayload) => void) => void;
  onDownloadFailed: (callback: (data: DownloadEventPayload) => void) => void;

  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
