import { Theme } from '../contexts/ThemeContext';

export interface UserPreferences {
  theme: Theme;
  showBookmarksBar: boolean;
  tabs: TabState[];
  activeTabId: string | null;
  bookmarks: BookmarkItem[];
  closedTabs: TabState[];
  isIncognito: boolean;
}

export interface TabState {
  id: string;
  title: string;
  url: string;
  faviconUrl?: string | null;
  isLoading?: boolean;
  hasError?: boolean;
  errorCode?: number;
  errorDescription?: string;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  folder?: string;
  dateAdded?: string;
  tags?: string[];
}

const PREFERENCES_KEY = 'khoj_browser_preferences';
const BOOKMARKS_KEY = 'khoj_browser_bookmarks';

class PreferencesStorage {
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

  // Preferences management
  loadPreferences(): UserPreferences {
    if (!this.isClient()) {
      return this.getDefaultPreferences();
    }

    const stored = localStorage.getItem(PREFERENCES_KEY);
    return this.safeJSONParse(stored, this.getDefaultPreferences());
  }

  savePreferences(preferences: Partial<UserPreferences>): void {
    if (!this.isClient()) return;

    const currentPreferences = this.loadPreferences();
    const updatedPreferences = { ...currentPreferences, ...preferences };
    const serialized = this.safeJSONStringify(updatedPreferences);
    
    if (serialized) {
      localStorage.setItem(PREFERENCES_KEY, serialized);
    }
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'system',
      showBookmarksBar: true,
      tabs: [],
      activeTabId: null,
      bookmarks: [],
      closedTabs: [],
      isIncognito: false
    };
  }

  // Theme management
  loadTheme(): Theme {
    const preferences = this.loadPreferences();
    return preferences.theme;
  }

  saveTheme(theme: Theme): void {
    this.savePreferences({ theme });
  }

  // Incognito mode management
  loadIncognitoMode(): boolean {
    const preferences = this.loadPreferences();
    return preferences.isIncognito;
  }

  saveIncognitoMode(isIncognito: boolean): void {
    this.savePreferences({ isIncognito });
  }

  // Bookmarks bar visibility
  loadBookmarksBarVisibility(): boolean {
    const preferences = this.loadPreferences();
    return preferences.showBookmarksBar;
  }

  saveBookmarksBarVisibility(visible: boolean): void {
    this.savePreferences({ showBookmarksBar: visible });
  }

  // Tabs management
  loadTabs(): { tabs: TabState[]; activeTabId: string | null } {
    const preferences = this.loadPreferences();
    return {
      tabs: preferences.tabs,
      activeTabId: preferences.activeTabId
    };
  }

  saveTabs(tabs: TabState[], activeTabId: string | null): void {
    this.savePreferences({ tabs, activeTabId });
  }

  // Bookmarks management
  loadBookmarks(): BookmarkItem[] {
    if (!this.isClient()) {
      return [];
    }

    const stored = localStorage.getItem(BOOKMARKS_KEY);
    return this.safeJSONParse(stored, []);
  }

  saveBookmarks(bookmarks: BookmarkItem[]): void {
    if (!this.isClient()) return;

    const serialized = this.safeJSONStringify(bookmarks);
    if (serialized) {
      localStorage.setItem(BOOKMARKS_KEY, serialized);
    }
  }

  addBookmark(bookmark: BookmarkItem): void {
    const bookmarks = this.loadBookmarks();
    const existingIndex = bookmarks.findIndex(b => b.id === bookmark.id);
    
    if (existingIndex >= 0) {
      bookmarks[existingIndex] = bookmark;
    } else {
      bookmarks.unshift(bookmark);
    }
    
    this.saveBookmarks(bookmarks);
  }

  removeBookmark(bookmarkId: string): void {
    const bookmarks = this.loadBookmarks();
    const filtered = bookmarks.filter(b => b.id !== bookmarkId);
    this.saveBookmarks(filtered);
  }

  updateBookmark(bookmarkId: string, updates: Partial<BookmarkItem>): void {
    const bookmarks = this.loadBookmarks();
    const index = bookmarks.findIndex(b => b.id === bookmarkId);
    
    if (index >= 0) {
      bookmarks[index] = { ...bookmarks[index], ...updates };
      this.saveBookmarks(bookmarks);
    }
  }

  // Closed tabs management
  loadClosedTabs(): TabState[] {
    const preferences = this.loadPreferences();
    return preferences.closedTabs;
  }

  saveClosedTabs(closedTabs: TabState[]): void {
    this.savePreferences({ closedTabs });
  }

  addClosedTab(tab: TabState): void {
    const closedTabs = this.loadClosedTabs();
    // Keep only last 10 closed tabs
    const updated = [...closedTabs.slice(-9), tab];
    this.saveClosedTabs(updated);
  }

  // Utility methods
  clearAllData(): void {
    if (!this.isClient()) return;
    
    localStorage.removeItem(PREFERENCES_KEY);
    localStorage.removeItem(BOOKMARKS_KEY);
  }

  exportData(): string {
    const preferences = this.loadPreferences();
    const bookmarks = this.loadBookmarks();
    
    return this.safeJSONStringify({
      preferences,
      bookmarks,
      exportDate: new Date().toISOString()
    }) || '{}';
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.preferences) {
        const serialized = this.safeJSONStringify(data.preferences);
        if (serialized) {
          localStorage.setItem(PREFERENCES_KEY, serialized);
        }
      }
      
      if (data.bookmarks) {
        const serialized = this.safeJSONStringify(data.bookmarks);
        if (serialized) {
          localStorage.setItem(BOOKMARKS_KEY, serialized);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export const preferencesStorage = new PreferencesStorage();
