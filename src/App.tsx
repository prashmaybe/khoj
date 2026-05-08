import React, { useState, useEffect } from 'react';
import './App.scss';
import { ElectronAPI } from './electron.d';
import { Browser } from './components/organisms';

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

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [url, setUrl] = useState<string>(HOME_URL);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  useEffect(() => {
    // Check if electronAPI is available
    if (!window.electronAPI) {
      console.error('electronAPI is not available. Make sure preload script is loaded correctly.');
      return;
    }

    // Create initial tab
    const initialTabId = Date.now().toString();
    createTab(initialTabId, HOME_URL);
    
    // Set up event listeners
    window.electronAPI.onTabLoading((tabId: string) => {
      setTabs(prevTabs => 
        prevTabs.map(tab => 
          tab.id === tabId ? { ...tab, isLoading: true } : tab
        )
      );
    });
    
    window.electronAPI.onTabLoaded((tabId: string, loadedUrl: string) => {
      setTabs(prevTabs => 
        prevTabs.map(tab => 
          tab.id === tabId
            ? {
                ...tab,
                isLoading: false,
                url: loadedUrl,
                // Title will be updated via `page-title-updated`; keep a reasonable fallback.
                title: loadedUrl === HOME_URL ? 'New Tab' : tab.title || loadedUrl,
              }
            : tab
        )
      );
    });

    window.electronAPI.onTabTitleUpdated((tabId: string, title: string) => {
      const cleaned = (title || '').trim();
      if (!cleaned) return;
      setTabs(prevTabs =>
        prevTabs.map(tab => (tab.id === tabId ? { ...tab, title: cleaned } : tab))
      );
    });

    window.electronAPI.onTabFaviconUpdated((tabId: string, faviconUrl: string | null) => {
      setTabs(prevTabs =>
        prevTabs.map(tab => (tab.id === tabId ? { ...tab, faviconUrl } : tab))
      );
    });
    
    window.electronAPI.onTabFailed((tabId: string, errorCode: number, errorDescription: string) => {
      console.error(`Tab ${tabId} failed to load:`, errorCode, errorDescription);
      setTabs(prevTabs => 
        prevTabs.map(tab => 
          tab.id === tabId ? { 
            ...tab, 
            isLoading: false, 
            hasError: true, 
            errorCode, 
            errorDescription 
          } : tab
        )
      );
    });
    
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('tab-loading');
        window.electronAPI.removeAllListeners('tab-loaded');
        window.electronAPI.removeAllListeners('tab-failed');
        window.electronAPI.removeAllListeners('tab-title-updated');
        window.electronAPI.removeAllListeners('tab-favicon-updated');
      }
    };
  }, []);

  // Set up message listener for home page navigation
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'navigate' && event.data.url) {
        setUrl(event.data.url);
        setTimeout(() => handleNavigate(), 0); // Use setTimeout to avoid stale closure
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []); // Empty dependency array since we use setTimeout

  const createTab = async (tabId?: string, initialUrl?: string) => {
    if (!window.electronAPI) {
      console.error('electronAPI is not available');
      return;
    }
    
    const newTabId = tabId || Date.now().toString();
    const targetUrl = initialUrl || HOME_URL;
    
    const createdTabId = await window.electronAPI.createTab(newTabId, targetUrl);
    if (createdTabId) {
      const newTab: Tab = {
        id: createdTabId,
        title: targetUrl === HOME_URL ? 'New Tab' : 'New Tab',
        url: targetUrl,
        faviconUrl: null,
        isLoading: true,
        hasError: false,
        errorCode: undefined,
        errorDescription: undefined
      };
      setTabs(prevTabs => [...prevTabs, newTab]);
      setActiveTabId(createdTabId);
      setUrl(targetUrl);
    }
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
    if (!activeTabId || !window.electronAPI) return;
    
    let formattedUrl = url.trim();
    if (formattedUrl === HOME_URL) {
      await window.electronAPI.navigateTab(activeTabId, HOME_URL);
      setUrl(HOME_URL);
      return;
    }
    
    // Check if this is a search query
    if (isSearchQuery(formattedUrl)) {
      const searchUrl = createGoogleSearchUrl(formattedUrl);
      await window.electronAPI.navigateTab(activeTabId, searchUrl);
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
      
      await window.electronAPI.navigateTab(activeTabId, formattedUrl);
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
    if (tabs.length === 1 || !window.electronAPI) return;
    
    await window.electronAPI.closeTab(tabId);
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      const newActiveTab = newTabs[newTabs.length - 1];
      setActiveTabId(newActiveTab.id);
      setUrl(newActiveTab.url);
    }
  };

  const switchTab = async (tabId: string) => {
    if (!window.electronAPI) return;
    
    setActiveTabId(tabId);
    await window.electronAPI.switchTab(tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setUrl(tab.url);
    }
  };

  const goBack = () => {
    if (activeTabId && window.electronAPI) {
      window.electronAPI.goBack(activeTabId);
    }
  };

  const goForward = () => {
    if (activeTabId && window.electronAPI) {
      window.electronAPI.goForward(activeTabId);
    }
  };

  const reload = () => {
    if (activeTabId && window.electronAPI) {
      window.electronAPI.reload(activeTabId);
    }
  };

  const goHome = async () => {
    if (!activeTabId || !window.electronAPI) return;
    await window.electronAPI.navigateTab(activeTabId, HOME_URL);
    setUrl(HOME_URL);
  };

  const retryLoad = async () => {
    if (!activeTabId || !window.electronAPI) return;
    
    // Clear error state and retry
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              isLoading: true,
              hasError: false,
              errorCode: undefined,
              errorDescription: undefined
            }
          : tab
      )
    );
    
    await window.electronAPI.navigateTab(activeTabId, activeTab?.url || HOME_URL);
  };

  return (
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
    />
  );
};

export default App;
