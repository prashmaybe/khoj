import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import TabBar from './TabBar';
import BrowserToolbar from './BrowserToolbar';
import BookmarksBar from './BookmarksBar';
import { ErrorPage } from '../pages/ErrorPages';

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
  showBookmarksBar?: boolean;
  onBookmarkClick?: (bookmark: { id: string; title: string; url: string; favicon?: string }) => void;
  onAddBookmark?: () => void;
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
  searchBarRef,
  showBookmarksBar = false,
  onBookmarkClick,
  onAddBookmark
}) => {
  const { colors } = useTheme();
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const isHomeTab = activeTab?.url.startsWith('khoj://');

  return (
    <View style={styles.browser}>
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={onTabClick}
        onTabClose={onTabClose}
        onNewTab={onNewTab}
      />
      
      <BookmarksBar
        visible={showBookmarksBar}
        onBookmarkClick={onBookmarkClick || (() => {})}
        onAddBookmark={onAddBookmark}
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
        ) : !activeTab ? (
          <View style={[styles.contentPlaceholder, { backgroundColor: colors.background }]}>
            <Text
              style={[
                styles.text,
                {
                  color: colors.textSecondary,
                  fontSize: colors.fontSize.base,
                  fontFamily: colors.fontFamily,
                },
              ]}
            >
              No tabs open
            </Text>
          </View>
        ) : isHomeTab ? (
          <View style={[styles.contentPlaceholder, { backgroundColor: colors.background }]}>
            <View style={styles.tabInfo}>
              <Text
                style={[
                  styles.text,
                  {
                    color: colors.text,
                    fontSize: 32,
                    fontFamily: colors.fontFamily,
                    fontWeight: '700',
                  },
                ]}
              >
                Khoj
              </Text>
              <Text
                style={[
                  styles.text,
                  {
                    color: colors.textSecondary,
                    fontSize: colors.fontSize.sm,
                    fontFamily: colors.fontFamily,
                  },
                ]}
              >
                Search or type a URL in the address bar to get started.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.iframeWrap}>
            <iframe
              title={activeTab.title || activeTab.url}
              src={activeTab.url}
              style={styles.iframe as any}
            />
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
    minHeight: 0,
  },
  iframeWrap: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  iframe: {
    borderWidth: 0,
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
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
