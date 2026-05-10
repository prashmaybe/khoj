import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { KeyboardShortcuts } from './services/KeyboardShortcuts';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useOrganisms, ComponentsProvider } from './hooks';
import { preferencesStorage, BookmarkItem } from './services/PreferencesStorage';

interface Tab {
  id: string;
  title: string;
  url: string;
  faviconUrl?: string | null;
  isLoading?: boolean;
  hasError?: boolean;
  errorCode?: number;
  errorDescription?: string;
}

const HOME_URL = 'khoj://home';
const DOWNLOADS_URL = 'khoj://downloads';
const HISTORY_URL = 'khoj://history';
const BOOKMARKS_URL = 'khoj://bookmarks';
const NAV_EVENT_NAME = 'khoj-nav-command';

const AppContent: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const { Browser, KeyboardShortcutsHelp } = useOrganisms();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [url, setUrl] = useState<string>(HOME_URL);
  const [closedTabs, setClosedTabs] = useState<Tab[]>([]);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showBookmarksBar, setShowBookmarksBar] = useState(() => {
    return preferencesStorage.loadBookmarksBarVisibility();
  });
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const searchBarRef = useRef<any>(null);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Check if current page is bookmarked
  const isCurrentPageBookmarked = (): boolean => {
    if (!activeTab || !activeTab.url || activeTab.url.startsWith('khoj://')) {
      return false;
    }
    return bookmarks.some(bookmark => bookmark.url === activeTab.url);
  };

  useEffect(() => {
    // Load saved tabs state
    const savedTabsState = preferencesStorage.loadTabs();
    
    if (savedTabsState.tabs.length > 0 && savedTabsState.activeTabId) {
      // Restore saved tabs
      setTabs(savedTabsState.tabs);
      setActiveTabId(savedTabsState.activeTabId);
      const activeTab = savedTabsState.tabs.find(tab => tab.id === savedTabsState.activeTabId);
      if (activeTab) {
        setUrl(activeTab.url);
      }
    } else {
      // Create initial tab for React Native
      const initialTabId = Date.now().toString();
      createTab(initialTabId, HOME_URL);
    }
    
    // Load saved closed tabs
    const savedClosedTabs = preferencesStorage.loadClosedTabs();
    setClosedTabs(savedClosedTabs);
    
    // Load bookmarks
    const loadedBookmarks = preferencesStorage.loadBookmarks();
    setBookmarks(loadedBookmarks);
  }, []);

  useEffect(() => {
    // Initialize keyboard shortcuts
    const keyboardShortcuts = new KeyboardShortcuts({
      // Tab & Window Management
      onNewTab: () => {
        addNewTab();
      },
      onReopenClosedTab: () => {
        if (closedTabs.length > 0) {
          const lastClosedTab = closedTabs[closedTabs.length - 1];
          setClosedTabs(prev => prev.slice(0, -1));
          createTab(lastClosedTab.id, lastClosedTab.url);
        }
      },
      onCloseTab: () => {
        if (activeTabId) {
          closeTab(activeTabId);
        }
      },
      onCycleTab: (direction) => {
        if (tabs.length <= 1) return;
        
        const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
        let newIndex;
        
        if (direction === 'forward') {
          newIndex = (currentIndex + 1) % tabs.length;
        } else {
          newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        }
        
        switchTab(tabs[newIndex].id);
      },
      onSwitchToTab: (tabNumber) => {
        if (tabNumber > 0 && tabNumber <= tabs.length) {
          switchTab(tabs[tabNumber - 1].id);
        }
      },
      onSwitchToLastTab: () => {
        if (tabs.length > 0) {
          switchTab(tabs[tabs.length - 1].id);
        }
      },
      
      // Address Bar
      onFocusAddressBar: () => {
        searchBarRef.current?.focus();
      },
      onSearchGoogle: () => {
        setUrl('');
        searchBarRef.current?.focus();
      },
      
      // Page Navigation & Display
      onGoBack: () => {
        goBack();
      },
      onGoForward: () => {
        goForward();
      },
      onReload: () => {
        reload();
      },
      onBookmarkPage: () => {
        openInternalTab(BOOKMARKS_URL, 'Bookmarks');
      },
      onToggleBookmarksBar: () => {
        setShowBookmarksBar(prev => {
          const newValue = !prev;
          preferencesStorage.saveBookmarksBarVisibility(newValue);
          return newValue;
        });
      },
      onOpenHistory: () => {
        openInternalTab(HISTORY_URL, 'History');
      },
      onOpenDownloads: () => {
        openInternalTab(DOWNLOADS_URL, 'Downloads');
      },
      onViewPageSource: () => {
        // TODO: Implement view page source functionality
        console.log('View page source functionality not yet implemented');
      },
      onOpenDevTools: () => {
        if (typeof window !== 'undefined' && window.electronAPI) {
          window.electronAPI.toggleDevTools();
        }
      },
      
      // Editing & General
      onFindText: () => {
        // TODO: Implement find functionality
        console.log('Find text functionality not yet implemented');
      },
      onPrintPage: () => {
        // TODO: Implement print functionality
        console.log('Print page functionality not yet implemented');
      },
      
      // Help
      onShowShortcutsHelp: () => {
        setShowShortcutsHelp(true);
      },
      
      // Window Management (Electron-specific)
      onNewWindow: () => {
        // TODO: Implement new window functionality
        console.log('New window functionality not yet implemented');
      },
      onNewIncognitoWindow: () => {
        // TODO: Implement incognito window functionality
        console.log('New incognito window functionality not yet implemented');
      },
      onCloseWindow: () => {
        // TODO: Implement close window functionality
        console.log('Close window functionality not yet implemented');
      },
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      keyboardShortcuts.handleKeyDown(event);
    };

    // Add event listener for keyboard shortcuts
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [tabs, activeTabId, closedTabs, url]);

  // Save tabs state when it changes
  useEffect(() => {
    preferencesStorage.saveTabs(tabs, activeTabId);
  }, [tabs, activeTabId]);

  // Save closed tabs when they change
  useEffect(() => {
    preferencesStorage.saveClosedTabs(closedTabs);
  }, [closedTabs]);

  
  const createTab = async (tabId?: string, initialUrl?: string, initialTitle?: string) => {
    const newTabId = tabId || Date.now().toString();
    const targetUrl = initialUrl || HOME_URL;
    
    const newTab: Tab = {
      id: newTabId,
      title: initialTitle || (targetUrl === HOME_URL ? 'New Tab' : targetUrl),
      url: targetUrl,
      faviconUrl: null,
      isLoading: false,
      hasError: false,
      errorCode: undefined,
      errorDescription: undefined
    };
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTabId);
    setUrl(targetUrl);
  };

  const isSearchQuery = (input: string): boolean => {
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
    const domainRegex = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    if (domainRegex.test(trimmed)) {
      return false;
    }
    
    // If it doesn't have a dot, it's likely a search query
    if (!trimmed.includes('.')) {
      return true;
    }
    
    // Default to treating as search query for safety
    return true;
  };

  const createGoogleSearchUrl = (query: string): string => {
    const encodedQuery = encodeURIComponent(query.trim());
    return `https://www.google.com/search?q=${encodedQuery}`;
  };

  const openInternalTab = (routeUrl: string, title: string) => {
    const existingTab = tabs.find(tab => tab.url === routeUrl);
    if (existingTab) {
      switchTab(existingTab.id);
      return;
    }

    createTab(undefined, routeUrl, title);
  };

  const navigateCurrentTab = (targetUrl: string, title?: string) => {
    if (!activeTabId) return;

    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === activeTabId
          ? {
              ...tab,
              url: targetUrl,
              title: title || targetUrl,
              hasError: false,
              errorCode: undefined,
              errorDescription: undefined,
            }
          : tab
      )
    );
    setUrl(targetUrl);
  };

  const handleNavigate = async () => {
    if (!activeTabId) return;
    
    let formattedUrl = url.trim();
    if (formattedUrl === HOME_URL) {
      navigateCurrentTab(HOME_URL, 'New Tab');
      return;
    }
    
    // Check if this is a search query
    if (isSearchQuery(formattedUrl)) {
      const searchUrl = createGoogleSearchUrl(formattedUrl);
      navigateCurrentTab(searchUrl, formattedUrl);
    } else {
      // It's a URL, format it properly
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }

      navigateCurrentTab(formattedUrl, formattedUrl);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };

  const addNewTab = () => {
    createTab();
  };

  const closeTab = async (tabId: string) => {
    if (tabs.length === 1) return;
    
    const tabToClose = tabs.find(tab => tab.id === tabId);
    if (tabToClose) {
      // Save closed tab to storage (limit to 10 closed tabs)
      preferencesStorage.addClosedTab(tabToClose);
      setClosedTabs(prev => [...prev.slice(-9), tabToClose]);
    }
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      const newActiveTab = newTabs[newTabs.length - 1];
      setActiveTabId(newActiveTab.id);
      setUrl(newActiveTab.url);
    }
  };

  const switchTab = async (tabId: string) => {
    setActiveTabId(tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setUrl(tab.url);
    }
  };

  const dispatchNavCommand = (action: 'back' | 'forward' | 'reload') => {
    if (!activeTabId || typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent(NAV_EVENT_NAME, {
        detail: { action, tabId: activeTabId },
      })
    );
  };

  const goBack = () => {
    if (!activeTabId) return;
    dispatchNavCommand('back');
  };

  const goForward = () => {
    if (!activeTabId) return;
    dispatchNavCommand('forward');
  };

  const reload = () => {
    if (!activeTabId) return;
    dispatchNavCommand('reload');
  };

  const goHome = async () => {
    if (!activeTabId) return;
    navigateCurrentTab(HOME_URL, 'New Tab');
  };

  const retryLoad = async () => {
    if (!activeTabId) return;
    
    // Clear error state and retry
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              isLoading: false,
              hasError: false,
              errorCode: undefined,
              errorDescription: undefined
            }
          : tab
      )
    );
  };

  const handleDownloadAction = (action: string, downloadId: string) => {
    console.log('Download action:', action, downloadId);
  };

  const handleHistoryAction = (action: string, historyId: string, data?: any) => {
    console.log('History action:', action, historyId, data);
    if (action === 'open') {
      const historyUrl = typeof data?.url === 'string' ? data.url : '';
      if (historyUrl) {
        navigateCurrentTab(historyUrl, data?.title);
      }
      return;
    }

    if (action === 'newTab') {
      const historyUrl = typeof data?.url === 'string' ? data.url : '';
      if (historyUrl) {
        createTab(undefined, historyUrl, data?.title);
      }
    }
  };

  const handleBookmarkAction = (action: string, bookmarkId: string, data?: any) => {
    console.log('Bookmark action:', action, bookmarkId, data);
    if (action === 'open') {
      const bookmarkUrl = typeof data?.url === 'string' ? data.url : '';
      if (bookmarkUrl) {
        navigateCurrentTab(bookmarkUrl, data?.title);
      }
      return;
    }

    if (action === 'newTab') {
      const bookmarkUrl = typeof data?.url === 'string' ? data.url : '';
      if (bookmarkUrl) {
        createTab(undefined, bookmarkUrl, data?.title);
      }
    }
  };

  const handleBookmarkBarClick = (bookmark: { id: string; title: string; url: string; favicon?: string }) => {
    navigateCurrentTab(bookmark.url, bookmark.title);
  };

  const handleAddBookmark = () => {
    openInternalTab(BOOKMARKS_URL, 'Bookmarks');
  };

  const handleUpdateTabError = (tabId: string, hasError: boolean, errorCode?: number, errorDescription?: string) => {
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === tabId
          ? {
              ...tab,
              hasError,
              errorCode,
              errorDescription,
              isLoading: false
            }
          : tab
      )
    );
  };

  const handleUpdateTabFavicon = (tabId: string, faviconUrl: string | null) => {
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === tabId
          ? {
              ...tab,
              faviconUrl
            }
          : tab
      )
    );
  };

  const handleBookmarkToggle = () => {
    if (!activeTab || !activeTab.url || activeTab.url.startsWith('khoj://')) {
      return;
    }

    const isBookmarked = isCurrentPageBookmarked();
    
    if (isBookmarked) {
      // Remove bookmark
      const bookmarkToRemove = bookmarks.find(bookmark => bookmark.url === activeTab.url);
      if (bookmarkToRemove) {
        preferencesStorage.removeBookmark(bookmarkToRemove.id);
        setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkToRemove.id));
      }
    } else {
      // Add bookmark
      const newBookmark: BookmarkItem = {
        id: Date.now().toString(),
        title: activeTab.title || activeTab.url,
        url: activeTab.url,
        icon: 'globe',
        folder: 'Development',
        dateAdded: new Date().toISOString().split('T')[0],
        tags: []
      };
      
      preferencesStorage.addBookmark(newBookmark);
      setBookmarks(prev => [newBookmark, ...prev]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Browser
        tabs={tabs}
        activeTabId={activeTabId}
        url={url}
        bookmarks={bookmarks}
        onUrlChange={setUrl}
        onNavigate={handleNavigate}
        onKeyPress={handleKeyPress}
        onTabClick={switchTab}
        onTabClose={closeTab}
        onNewTab={addNewTab}
        onBack={goBack}
        onForward={goForward}
        onReload={reload}
        onHome={goHome}
        onRetryLoad={retryLoad}
        searchBarRef={searchBarRef}
        showBookmarksBar={showBookmarksBar}
        onBookmarkClick={handleBookmarkBarClick}
        onAddBookmark={handleAddBookmark}
        onDownloadAction={handleDownloadAction}
        onHistoryAction={handleHistoryAction}
        onBookmarkAction={handleBookmarkAction}
        onUpdateTabError={handleUpdateTabError}
        onUpdateTabFavicon={handleUpdateTabFavicon}
        isBookmarked={isCurrentPageBookmarked()}
        onBookmarkToggle={handleBookmarkToggle}
      />
      <KeyboardShortcutsHelp
        visible={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
    </SafeAreaView>
  );
});

const App: React.FC = () => {
  return (
    <ComponentsProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ComponentsProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
});

export default App;
