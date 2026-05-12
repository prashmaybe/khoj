export interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  size: string;
  progress: number;
  status: 'downloading' | 'completed' | 'paused' | 'failed';
  date: string;
  filePath: string;
  totalBytes?: number;
  downloadedBytes?: number;
  error?: string;
}

const DOWNLOADS_KEY = 'khoj_browser_downloads';

class DownloadsStorage {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private safeJSONParse<T>(str: string | null, defaultValue: T): T {
    if (!str) return defaultValue;
    try {
      return JSON.parse(str);
    } catch (error) {
      console.error('Error parsing JSON from storage:', error);
      return defaultValue;
    }
  }

  private safeJSONStringify(obj: any): string | null {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      console.error('Error stringifying object for storage:', error);
      return null;
    }
  }

  loadDownloads(): DownloadItem[] {
    if (!this.isClient()) {
      return [];
    }

    const stored = localStorage.getItem(DOWNLOADS_KEY);
    return this.safeJSONParse(stored, []);
  }

  saveDownloads(downloads: DownloadItem[]): void {
    if (!this.isClient()) return;

    const serialized = this.safeJSONStringify(downloads);
    if (serialized) {
      localStorage.setItem(DOWNLOADS_KEY, serialized);
    }
  }

  addDownload(item: Omit<DownloadItem, 'id' | 'date' | 'progress'>): string {
    const downloads = this.loadDownloads();
    const newItem: DownloadItem = {
      ...item,
      id: this.generateId(),
      date: new Date().toLocaleString(),
      progress: 0
    };
    
    downloads.unshift(newItem);
    
    // Keep only last 500 downloads
    const trimmed = downloads.slice(0, 500);
    this.saveDownloads(trimmed);
    
    return newItem.id;
  }

  updateDownload(downloadId: string, updates: Partial<DownloadItem>): void {
    const downloads = this.loadDownloads();
    const index = downloads.findIndex(item => item.id === downloadId);
    
    if (index >= 0) {
      downloads[index] = { ...downloads[index], ...updates };
      this.saveDownloads(downloads);
    }
  }

  updateDownloadProgress(downloadId: string, progress: number, downloadedBytes?: number): void {
    this.updateDownload(downloadId, { 
      progress,
      ...(downloadedBytes !== undefined && { downloadedBytes })
    });
  }

  setDownloadStatus(downloadId: string, status: DownloadItem['status'], error?: string): void {
    this.updateDownload(downloadId, { 
      status,
      ...(error && { error })
    });
  }

  removeDownload(downloadId: string): void {
    const downloads = this.loadDownloads();
    const filtered = downloads.filter(item => item.id !== downloadId);
    this.saveDownloads(filtered);
  }

  clearCompletedDownloads(): void {
    const downloads = this.loadDownloads();
    const filtered = downloads.filter(item => item.status !== 'completed');
    this.saveDownloads(filtered);
  }

  clearAllDownloads(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(DOWNLOADS_KEY);
  }

  getDownloadsByStatus(status: DownloadItem['status']): DownloadItem[] {
    const downloads = this.loadDownloads();
    return downloads.filter(item => item.status === status);
  }

  getActiveDownloads(): DownloadItem[] {
    const downloads = this.loadDownloads();
    return downloads.filter(item => item.status === 'downloading' || item.status === 'paused');
  }

  getCompletedDownloads(): DownloadItem[] {
    return this.getDownloadsByStatus('completed');
  }

  getFailedDownloads(): DownloadItem[] {
    return this.getDownloadsByStatus('failed');
  }

  retryDownload(downloadId: string): void {
    this.updateDownload(downloadId, {
      status: 'downloading',
      progress: 0,
      downloadedBytes: 0,
      error: undefined
    });
  }

  pauseDownload(downloadId: string): void {
    this.setDownloadStatus(downloadId, 'paused');
  }

  resumeDownload(downloadId: string): void {
    this.setDownloadStatus(downloadId, 'downloading');
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Utility methods for file size formatting
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Export/Import functionality
  exportDownloads(): string {
    const downloads = this.loadDownloads();
    return this.safeJSONStringify({
      downloads,
      exportDate: new Date().toISOString()
    }) || '{}';
  }

  importDownloads(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.downloads && Array.isArray(data.downloads)) {
        const serialized = this.safeJSONStringify(data.downloads);
        if (serialized) {
          localStorage.setItem(DOWNLOADS_KEY, serialized);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error importing downloads:', error);
      return false;
    }
  }
}

export const downloadsStorage = new DownloadsStorage();
