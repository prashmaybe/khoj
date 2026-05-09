import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import TabBar from './TabBar';
import BrowserToolbar from './BrowserToolbar';
import BookmarksBar from './BookmarksBar';
import { ErrorPage } from '../pages/ErrorPages';
import DownloadsPage from '../pages/DownloadsPage';
import HistoryPage from '../pages/HistoryPage';
import BookmarksPage from '../pages/BookmarksPage';

const NAV_EVENT_NAME = 'khoj-browser-nav-command';

interface BrowserNavCommandDetail {
  action: 'back' | 'forward' | 'reload';
  tabId: string;
}

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
  onDownloadAction?: (action: string, downloadId: string) => void;
  onHistoryAction?: (action: string, historyId: string, data?: any) => void;
  onBookmarkAction?: (action: string, bookmarkId: string, data?: any) => void;
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
  onAddBookmark,
  onDownloadAction,
  onHistoryAction,
  onBookmarkAction
}) => {
  const { colors } = useTheme();
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const isHomeTab = activeTab?.url.startsWith('khoj://');
  const isDownloadsTab = activeTab?.url === 'khoj://downloads';
  const isHistoryTab = activeTab?.url === 'khoj://history';
  const isBookmarksTab = activeTab?.url === 'khoj://bookmarks';
  const isElectronRuntime = typeof window !== 'undefined' && !!window.electronAPI;
  const embedContainerRef = useRef<HTMLDivElement | null>(null);
  const embedRef = useRef<any>(null);
  const webviewStyle: React.CSSProperties = {
    border: 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    minHeight: '100%',
    display: 'block',
  };

  useEffect(() => {
    const applyEmbedSize = () => {
      const container = embedContainerRef.current;
      const embed = embedRef.current as HTMLElement | null;
      if (!container || !embed) return;

      const rect = container.getBoundingClientRect();
      const height = Math.max(0, Math.floor(rect.height));
      if (height === 0) return;

      embed.style.setProperty('height', `${height}px`, 'important');
      embed.style.setProperty('min-height', `${height}px`, 'important');
      embed.style.setProperty('max-height', `${height}px`, 'important');
      embed.style.setProperty('width', '100%', 'important');
      embed.style.setProperty('display', 'block', 'important');

      // Best-effort fix: when available, force the internal guest iframe to fill host height.
      const shadowRoot = (embed as any).shadowRoot as ShadowRoot | null;
      const guestFrame = shadowRoot?.querySelector('iframe') as HTMLIFrameElement | null;
      if (guestFrame) {
        guestFrame.style.setProperty('height', '100%', 'important');
        guestFrame.style.setProperty('min-height', '100%', 'important');
        guestFrame.style.setProperty('width', '100%', 'important');
        guestFrame.style.setProperty('display', 'block', 'important');
      }
    };

    applyEmbedSize();
    const delayed = window.setTimeout(applyEmbedSize, 100);
    window.addEventListener('resize', applyEmbedSize);
    return () => {
      window.clearTimeout(delayed);
      window.removeEventListener('resize', applyEmbedSize);
    };
  }, [activeTab?.id, activeTab?.url, isElectronRuntime]);

  useEffect(() => {
    if (!isElectronRuntime || typeof window === 'undefined') return;

    const handleNavCommand = (event: Event) => {
      const customEvent = event as CustomEvent<BrowserNavCommandDetail>;
      const command = customEvent.detail;
      if (!command || command.tabId !== activeTabId) return;

      const webview = embedRef.current as any;
      if (!webview) return;

      if (command.action === 'back' && typeof webview.canGoBack === 'function' && webview.canGoBack()) {
        webview.goBack();
        return;
      }

      if (command.action === 'forward' && typeof webview.canGoForward === 'function' && webview.canGoForward()) {
        webview.goForward();
        return;
      }

      if (command.action === 'reload' && typeof webview.reload === 'function') {
        webview.reload();
      }
    };

    window.addEventListener(NAV_EVENT_NAME, handleNavCommand as EventListener);
    return () => {
      window.removeEventListener(NAV_EVENT_NAME, handleNavCommand as EventListener);
    };
  }, [activeTabId, isElectronRuntime]);

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
        ) : isDownloadsTab ? (
          <DownloadsPage onDownloadAction={onDownloadAction} />
        ) : isHistoryTab ? (
          <HistoryPage onHistoryAction={onHistoryAction} />
        ) : isBookmarksTab ? (
          <BookmarksPage onBookmarkAction={onBookmarkAction} />
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
          <View style={styles.iframeWrap} ref={embedContainerRef as any}>
            {isElectronRuntime ? (
              <webview
                key={activeTab.id}
                src={activeTab.url}
                ref={embedRef}
                style={webviewStyle as any}
                allowpopups={true}
              />
            ) : (
              <iframe
                title={activeTab.title || activeTab.url}
                src={activeTab.url}
                ref={embedRef}
                style={webviewStyle as any}
              />
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
    height: '100%',
  },
  browserContent: {
    flex: 1,
    minHeight: 0,
    height: '100%',
  },
  iframeWrap: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    display: 'flex',
    overflow: 'hidden',
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
