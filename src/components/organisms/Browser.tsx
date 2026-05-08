import React from 'react';
import TabBar from './TabBar';
import BrowserToolbar from './BrowserToolbar';
import { ErrorPage } from '../ErrorPages';

interface TabData {
  id: string;
  title: string;
  url: string;
  faviconUrl?: string | null;
  isLoading?: boolean;
  hasError?: boolean;
  errorCode?: number;
  errorDescription?: string;
}

interface BrowserProps {
  tabs: TabData[];
  activeTabId: string | null;
  url: string;
  onUrlChange: (url: string) => void;
  onNavigate: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  onRetryLoad: () => void;
}

const Browser: React.FC<BrowserProps> = ({
  tabs,
  activeTabId,
  url,
  onUrlChange,
  onNavigate,
  onKeyPress,
  onTabClick,
  onTabClose,
  onNewTab,
  onBack,
  onForward,
  onReload,
  onHome,
  onRetryLoad
}) => {
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="browser">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={onTabClick}
        onTabClose={onTabClose}
        onNewTab={onNewTab}
      />
      
      <BrowserToolbar
        url={url}
        onUrlChange={onUrlChange}
        onNavigate={onNavigate}
        onKeyPress={onKeyPress}
        onBack={onBack}
        onForward={onForward}
        onReload={onReload}
        onHome={onHome}
        isLoading={activeTab?.isLoading}
        disabled={activeTab?.isLoading}
      />
      
      <div className="browser-content">
        {activeTab?.hasError ? (
          <ErrorPage
            errorCode={activeTab.errorCode || -1}
            errorDescription={activeTab.errorDescription || 'Unknown error'}
            url={activeTab.url}
            onRetry={onRetryLoad}
          />
        ) : (
          /* Content is rendered by WebContentsView in main process */
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
        )}
      </div>
    </div>
  );
};

export default Browser;
