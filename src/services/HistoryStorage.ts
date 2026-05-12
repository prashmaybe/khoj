export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  visitCount: number;
  lastVisited: string;
  timestamp: number;
}

const HISTORY_KEY = 'khoj_browser_history';

class HistoryStorage {
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

  loadHistory(): HistoryItem[] {
    if (!this.isClient()) {
      return [];
    }

    const stored = localStorage.getItem(HISTORY_KEY);
    return this.safeJSONParse(stored, []);
  }

  saveHistory(history: HistoryItem[]): void {
    if (!this.isClient()) return;

    const serialized = this.safeJSONStringify(history);
    if (serialized) {
      localStorage.setItem(HISTORY_KEY, serialized);
    }
  }

  addHistoryItem(item: Omit<HistoryItem, 'id' | 'visitCount' | 'timestamp'>): void {
    const history = this.loadHistory();
    const existingIndex = history.findIndex(h => h.url === item.url);
    
    if (existingIndex >= 0) {
      // Update existing item
      history[existingIndex] = {
        ...history[existingIndex],
        ...item,
        visitCount: history[existingIndex].visitCount + 1,
        lastVisited: new Date().toLocaleString(),
        timestamp: Date.now()
      };
      // Move to top
      const updatedItem = history.splice(existingIndex, 1)[0];
      history.unshift(updatedItem);
    } else {
      // Add new item
      const newItem: HistoryItem = {
        ...item,
        id: this.generateId(),
        visitCount: 1,
        lastVisited: new Date().toLocaleString(),
        timestamp: Date.now()
      };
      history.unshift(newItem);
    }
    
    // Keep only last 1000 items
    const trimmed = history.slice(0, 1000);
    this.saveHistory(trimmed);
  }

  removeHistoryItem(itemId: string): void {
    const history = this.loadHistory();
    const filtered = history.filter(item => item.id !== itemId);
    this.saveHistory(filtered);
  }

  updateHistoryItem(itemId: string, updates: Partial<HistoryItem>): void {
    const history = this.loadHistory();
    const index = history.findIndex(item => item.id === itemId);
    
    if (index >= 0) {
      history[index] = { ...history[index], ...updates };
      this.saveHistory(history);
    }
  }

  clearHistory(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(HISTORY_KEY);
  }

  clearHistoryByTimeRange(hours: number): void {
    const history = this.loadHistory();
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const filtered = history.filter(item => item.timestamp < cutoffTime);
    this.saveHistory(filtered);
  }

  getHistoryByTimeRange(hours: number): HistoryItem[] {
    const history = this.loadHistory();
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    return history.filter(item => item.timestamp >= cutoffTime);
  }

  searchHistory(query: string): HistoryItem[] {
    const history = this.loadHistory();
    const lowerQuery = query.toLowerCase();
    return history.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.url.toLowerCase().includes(lowerQuery)
    );
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Export/Import functionality
  exportHistory(): string {
    const history = this.loadHistory();
    return this.safeJSONStringify({
      history,
      exportDate: new Date().toISOString()
    }) || '{}';
  }

  importHistory(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.history && Array.isArray(data.history)) {
        const serialized = this.safeJSONStringify(data.history);
        if (serialized) {
          localStorage.setItem(HISTORY_KEY, serialized);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error importing history:', error);
      return false;
    }
  }
}

export const historyStorage = new HistoryStorage();
