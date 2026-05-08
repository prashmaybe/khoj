import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Browser } from './components/organisms';
import KeyboardShortcutsHelp from './components/organisms/KeyboardShortcutsHelp';
import { KeyboardShortcuts } from './services/KeyboardShortcuts';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

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

const AppContent: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [url, setUrl] = useState<string>(HOME_URL);
  const [closedTabs, setClosedTabs] = useState<Tab[]>([]);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const searchBarRef = useRef<any>(null);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  useEffect(() => {
    // Create initial tab for React Native
    const initialTabId = Date.now().toString();
    createTab(initialTabId, HOME_URL);
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
        // TODO: Implement bookmark functionality
        console.log('Bookmark page functionality not yet implemented');
      },
      onToggleBookmarksBar: () => {
        // TODO: Implement bookmarks bar toggle
        console.log('Toggle bookmarks bar functionality not yet implemented');
      },
      onOpenHistory: () => {
        // TODO: Implement history functionality
        console.log('Open history functionality not yet implemented');
      },
      onOpenDownloads: () => {
        // TODO: Implement downloads functionality
        console.log('Open downloads functionality not yet implemented');
      },
      onViewPageSource: () => {
        // TODO: Implement view page source functionality
        console.log('View page source functionality not yet implemented');
      },
      onOpenDevTools: () => {
        // TODO: Implement dev tools functionality
        console.log('Open dev tools functionality not yet implemented');
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

  
  const createTab = async (tabId?: string, initialUrl?: string) => {
    const newTabId = tabId || Date.now().toString();
    const targetUrl = initialUrl || HOME_URL;
    
    const newTab: Tab = {
      id: newTabId,
      title: targetUrl === HOME_URL ? 'New Tab' : 'New Tab',
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

  const handleNavigate = async () => {
    if (!activeTabId) return;
    
    let formattedUrl = url.trim();
    if (formattedUrl === HOME_URL) {
      setTabs(prevTabs => 
        prevTabs.map(tab => 
          tab.id === activeTabId ? { ...tab, url: HOME_URL } : tab
        )
      );
      setUrl(HOME_URL);
      return;
    }
    
    // Check if this is a search query
    if (isSearchQuery(formattedUrl)) {
      const searchUrl = createGoogleSearchUrl(formattedUrl);
      setTabs(prevTabs => 
        prevTabs.map(tab => 
          tab.id === activeTabId 
            ? { 
                ...tab, 
                url: searchUrl, 
                title: formattedUrl,
                hasError: false,
                errorCode: undefined,
                errorDescription: undefined
              }
            : tab
        )
      );
      setUrl(searchUrl);
    } else {
      // It's a URL, format it properly
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }
      
      setTabs(prevTabs => 
        prevTabs.map(tab => 
          tab.id === activeTabId 
            ? { 
                ...tab, 
                url: formattedUrl, 
                title: formattedUrl,
                hasError: false,
                errorCode: undefined,
                errorDescription: undefined
              }
            : tab
        )
      );
      setUrl(formattedUrl);
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
      // Save closed tab to history (limit to 10 closed tabs)
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

  const goBack = () => {
    // Navigation history would need to be implemented for React Native
    console.log('Go back functionality');
  };

  const goForward = () => {
    // Navigation history would need to be implemented for React Native
    console.log('Go forward functionality');
  };

  const reload = () => {
    // WebView reload would need to be implemented for React Native
    console.log('Reload functionality');
  };

  const goHome = async () => {
    if (!activeTabId) return;
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId ? { ...tab, url: HOME_URL } : tab
      )
    );
    setUrl(HOME_URL);
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Browser
        tabs={tabs}
        activeTabId={activeTabId}
        url={url}
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
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
