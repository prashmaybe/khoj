import React, { useState } from 'react';
import './App.scss';

interface Tab {
  id: string;
  title: string;
  url: string;
}

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'New Tab', url: 'https://www.google.com' }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('1');
  const [url, setUrl] = useState<string>('https://www.google.com');

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const handleNavigate = () => {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
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
    const newTab: Tab = {
      id: Date.now().toString(),
      title: 'New Tab',
      url: 'https://www.google.com'
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setUrl('https://www.google.com');
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      const newActiveTab = newTabs[newTabs.length - 1];
      setActiveTabId(newActiveTab.id);
      setUrl(newActiveTab.url);
    }
  };

  const switchTab = (tabId: string) => {
    setActiveTabId(tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setUrl(tab.url);
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
        <div className="url-bar">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter URL..."
            className="url-input"
          />
          <button onClick={handleNavigate} className="navigate-button">
            Go
          </button>
        </div>
      </div>
      
      <div className="browser-content">
        {activeTab && (
          <webview
            src={activeTab.url}
            style={{ width: '100%', height: '100%' }}
            nodeintegration={false}
            security={false}
            allowpopups={true}
          />
        )}
      </div>
    </div>
  );
};

export default App;
