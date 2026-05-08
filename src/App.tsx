import React, { useState, useEffect } from 'react';
import './App.scss';
import { ElectronAPI } from './electron.d';

interface Tab {
  id: string;
  title: string;
  url: string;
  isLoading?: boolean;
}

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [url, setUrl] = useState<string>('https://www.google.com');

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  useEffect(() => {
    // Check if electronAPI is available
    if (!window.electronAPI) {
      console.error('electronAPI is not available. Make sure preload script is loaded correctly.');
      return;
    }

    // Create initial tab
    const initialTabId = Date.now().toString();
    createTab(initialTabId, 'https://www.google.com');
    
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
          tab.id === tabId ? { ...tab, isLoading: false, url: loadedUrl, title: loadedUrl } : tab
        )
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
      }
    };
  }, []);

  const createTab = async (tabId?: string, initialUrl?: string) => {
    if (!window.electronAPI) {
      console.error('electronAPI is not available');
      return;
    }
    
    const newTabId = tabId || Date.now().toString();
    const targetUrl = initialUrl || 'https://www.google.com';
    
    const createdTabId = await window.electronAPI.createTab(newTabId, targetUrl);
    if (createdTabId) {
      const newTab: Tab = {
        id: createdTabId,
        title: 'New Tab',
        url: targetUrl,
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

  return (
    <div className="browser">
      <div className="tab-bar">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={() => switchTab(tab.id)}
          >
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
          <button onClick={goBack} className="nav-button" title="Back">
            ←
          </button>
          <button onClick={goForward} className="nav-button" title="Forward">
            →
          </button>
          <button onClick={reload} className="nav-button" title="Reload">
            ↻
          </button>
        </div>
        <div className="url-bar">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter URL..."
            className="url-input"
            disabled={activeTab?.isLoading}
          />
          <button onClick={handleNavigate} className="navigate-button" disabled={activeTab?.isLoading}>
            {activeTab?.isLoading ? 'Loading...' : 'Go'}
          </button>
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
