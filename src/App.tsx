import React, { useState, useEffect } from 'react';
import './App.scss';
import { ElectronAPI } from './electron.d';

interface Tab {
  id: string;
  title: string;
  url: string;
  faviconUrl?: string | null;
  isLoading?: boolean;
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
          tab.id === tabId ? { ...tab, isLoading: false } : tab
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
        isLoading: true
      };
      setTabs(prevTabs => [...prevTabs, newTab]);
      setActiveTabId(createdTabId);
      setUrl(targetUrl);
    }
  };

  const handleNavigate = async () => {
    if (!activeTabId || !window.electronAPI) return;
    
    let formattedUrl = url.trim();
    if (formattedUrl === HOME_URL) {
      await window.electronAPI.navigateTab(activeTabId, HOME_URL);
      setUrl(HOME_URL);
      return;
    }
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    await window.electronAPI.navigateTab(activeTabId, formattedUrl);
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, url: formattedUrl, title: formattedUrl }
          : tab
      )
    );
    setUrl(formattedUrl);
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

  return (
    <div className="browser">
      <div className="tab-bar">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={() => switchTab(tab.id)}
          >
            <span className="tab-favicon" aria-hidden="true">
              {tab.faviconUrl ? <img src={tab.faviconUrl} alt="" /> : <span className="tab-favicon-fallback" />}
            </span>
            <span className="tab-title">{tab.title}</span>
            {tabs.length > 1 && (
              <button
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button className="new-tab-button" onClick={addNewTab}>
          +
        </button>
      </div>
      
      <div className="browser-toolbar">
        <div className="navigation-controls">
          <button onClick={goBack} className="nav-button" title="Back" aria-label="Back">
            <span className="nav-icon" aria-hidden="true">←</span>
          </button>
          <button onClick={goForward} className="nav-button" title="Forward" aria-label="Forward">
            <span className="nav-icon" aria-hidden="true">→</span>
          </button>
          <button onClick={reload} className="nav-button" title="Reload" aria-label="Reload">
            <span className="nav-icon" aria-hidden="true">↻</span>
          </button>
        </div>
        <button onClick={goHome} className="nav-button home-button" title="Home" aria-label="Home">
          <span className="nav-icon" aria-hidden="true">⌂</span>
        </button>
        <div className="url-bar">
          <div className={`omnibox ${activeTab?.isLoading ? 'is-loading' : ''}`}>
            <span className="omnibox-lock" aria-hidden="true">🔒</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search or type a URL"
              className="url-input"
              disabled={activeTab?.isLoading}
            />
            <button
              onClick={handleNavigate}
              className="navigate-button"
              disabled={activeTab?.isLoading}
              aria-label="Go"
              title="Go"
            >
              {activeTab?.isLoading ? '⟳' : '→'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="browser-content">
        {/* Content is rendered by WebContentsView in main process */}
        <div className="content-placeholder">
          {activeTab ? (
            <div className="tab-info">
              <p>Active Tab: {activeTab.title}</p>
              <p>URL: {activeTab.url}</p>
              {activeTab.isLoading && <p>Loading...</p>}
            </div>
          ) : (
            <p>No tabs open</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
