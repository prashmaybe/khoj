import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
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
  searchBarRef?: React.RefObject<any>;
}

const Browser: React.FC<BrowserProps> = React.memo(({
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
  onRetryLoad,
  searchBarRef
}) => {
  const { colors } = useTheme();
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <View style={styles.browser}>
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
        searchBarRef={searchBarRef}
      />
      
      <View style={styles.browserContent}>
        {activeTab?.hasError ? (
          <ErrorPage
            errorCode={activeTab.errorCode || -1}
            errorDescription={activeTab.errorDescription || 'Unknown error'}
            url={activeTab.url}
            onRetry={onRetryLoad}
          />
        ) : (
          /* Content would be rendered by WebView in React Native */
          <View style={[styles.contentPlaceholder, { backgroundColor: colors.background }]}>
            {activeTab ? (
              <View style={styles.tabInfo}>
                <Text style={[styles.text, { 
                  color: colors.text, 
                  fontSize: colors.fontSize.base,
                  fontFamily: colors.fontFamily,
                  fontWeight: colors.fontWeight.medium
                }]}>
                  Active Tab: {activeTab.title}
                </Text>
                <Text style={[styles.text, { 
                  color: colors.textSecondary, 
                  fontSize: colors.fontSize.sm,
                  fontFamily: colors.fontFamily
                }]}>
                  URL: {activeTab.url}
                </Text>
                {activeTab.isLoading && (
                  <Text style={[styles.text, { 
                    color: colors.buttonPrimary, 
                    fontSize: colors.fontSize.sm,
                    fontFamily: colors.fontFamily,
                    fontWeight: colors.fontWeight.medium
                  }]}>
                    Loading...
                  </Text>
                )}
              </View>
            ) : (
              <Text style={[styles.text, { 
                color: colors.textSecondary, 
                fontSize: colors.fontSize.base,
                fontFamily: colors.fontFamily
              }]}>
                No tabs open
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  browser: {
    flex: 1,
  },
  browserContent: {
    flex: 1,
  },
  contentPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tabInfo: {
    alignItems: 'center',
  },
  text: {
    marginBottom: 8,
  },
});

export default Browser;
