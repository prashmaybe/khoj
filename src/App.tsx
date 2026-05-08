import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
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
    // Create initial tab for React Native
    const initialTabId = Date.now().toString();
    createTab(initialTabId, HOME_URL);
  }, []);

  
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
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
