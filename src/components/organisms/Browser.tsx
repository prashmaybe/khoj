import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useOrganisms, useMolecules, usePages } from '../../hooks';
import { passwordAutofill } from '../../services/PasswordAutofill';
import { historyStorage } from '../../services/HistoryStorage';
import { toWebviewSrc, isInternalRoute } from '../../utils/loadableUrl';

const NAV_EVENT_NAME = 'khoj-nav-command';

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
  bookmarks?: { id: string; title: string; url: string; favicon?: string }[];
  onUrlChange: (url: string) => void;
  onNavigate: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  onNewTabWithUrl?: (url: string) => void;
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
  onUpdateTabError?: (tabId: string, hasError: boolean, errorCode?: number, errorDescription?: string) => void;
  onUpdateTabFavicon?: (tabId: string, faviconUrl: string | null) => void;
  onTabNavigate?: (tabId: string, url: string, title?: string) => void;
  onTabTitleUpdate?: (tabId: string, title: string) => void;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  isIncognito?: boolean;
  onNewWindow?: () => void;
  onExit?: () => void;
  onNavigateToPage?: (url: string) => void;
}

const Browser: React.FC<BrowserProps> = React.memo(({
  tabs,
  activeTabId,
  url,
  bookmarks = [],
  onUrlChange,
  onNavigate,
  onKeyPress,
  onTabClick,
  onTabClose,
  onNewTab,
  onNewTabWithUrl,
  onBack,
  onForward,
  onReload,
  onHome,
  onRetryLoad,
  searchBarRef,
  showBookmarksBar,
  onBookmarkClick,
  onAddBookmark,
  onDownloadAction,
  onHistoryAction,
  onBookmarkAction,
  onUpdateTabError,
  onUpdateTabFavicon,
  onTabNavigate,
  onTabTitleUpdate,
  isBookmarked = false,
  onBookmarkToggle,
  isIncognito = false,
  onNewWindow,
  onExit,
  onNavigateToPage,
}) => {
  const { colors } = useTheme();
  const { TabBar, BrowserToolbar, BookmarksBar, PasswordManager } = useOrganisms();
  const { ErrorPage, DownloadsPage, HistoryPage, BookmarksPage } = usePages();
  const [showPasswordManager, setShowPasswordManager] = React.useState(false);
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const isHomeTab = activeTab?.url.startsWith('khoj://');
  const isDownloadsTab = activeTab?.url === 'khoj://downloads';
  const isHistoryTab = activeTab?.url === 'khoj://history';
  const isBookmarksTab = activeTab?.url === 'khoj://bookmarks';
  const isElectronRuntime = typeof window !== 'undefined' && !!window.electronAPI;
  const embedContainerRef = useRef<HTMLDivElement | null>(null);
  const webviewRefs = useRef<Map<string, any>>(new Map());
  const webviewReadyStates = useRef<Map<string, boolean>>(new Map());
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

  const tabContainerStyle = {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex' as const,
  };

  const handleWebviewError = (tabId: string, error: any) => {
    console.error('Webview error for tab', tabId, error);
    if (onUpdateTabError) {
      onUpdateTabError(
        tabId,
        true,
        error?.code || -1,
        error?.description || error?.message || 'Failed to load page'
      );
    }
  };

  const handleWebviewLoad = (tabId: string) => {
    if (onUpdateTabError) {
      onUpdateTabError(tabId, false);
    }
    
    // Add to history when page loads successfully
    const tab = tabs.find(t => t.id === tabId);
    if (tab && !isIncognito && tab.url && !tab.url.startsWith('khoj://')) {
      try {
        // Get the actual page title from the webview/iframe
        const webview = webviewRefs.current.get(tabId);
        let pageTitle = tab.title || tab.url;
        
        if (webview) {
          if (isElectronRuntime) {
            // For Electron webview, try to get the title
            try {
              pageTitle = (webview as any).getTitle() || tab.title || tab.url;
            } catch (e) {
              console.log('Could not get webview title:', e);
            }
          } else {
            // For iframe, try to get the title from the document
            try {
              const iframeDoc = (webview as HTMLIFrameElement).contentDocument;
              if (iframeDoc && iframeDoc.title) {
                pageTitle = iframeDoc.title;
              }
            } catch (e) {
              console.log('Could not get iframe title:', e);
            }
          }
        }
        
        historyStorage.addHistoryItem({
          title: pageTitle,
          url: tab.url,
          icon: 'globe',
          lastVisited: new Date().toLocaleString()
        });
        
        console.log('Added to history:', { title: pageTitle, url: tab.url });
      } catch (error) {
        console.error('Error saving to history:', error);
      }
    }
  };

  const injectPasswordAutofill = async (webview: HTMLElement, pageUrl: string) => {
    if (isIncognito || !pageUrl || isInternalRoute(pageUrl)) return;
    try {
      const passwords = await passwordAutofill.getPasswordSuggestionsForUrl(pageUrl);
      if (passwords.length === 0) return;
      const script = passwordAutofill.buildWebviewInjectionScript(
        passwords.map(p => ({
          title: p.title,
          username: p.username,
          password: p.password,
          url: p.url,
        }))
      );
      await (webview as any).executeJavaScript(script);
    } catch (error) {
      console.warn('Password autofill injection failed:', error);
    }
  };

  const extractFaviconUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      // Use Google's favicon service directly - it's reliable and avoids CORS issues
      const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.origin}&sz=16`;
      console.log('Using Google favicon service for:', urlObj.origin, '→', googleFaviconUrl);
      return googleFaviconUrl;
    } catch (error) {
      console.error('Error extracting favicon:', error);
      return null;
    }
  };

  const handleFaviconUpdate = (tabId: string, url: string) => {
    console.log('Updating favicon for tab:', tabId, 'URL:', url);
    const faviconUrl = extractFaviconUrl(url);
    console.log('Extracted favicon URL:', faviconUrl);
    if (onUpdateTabFavicon) {
      onUpdateTabFavicon(tabId, faviconUrl);
    }
  };

  useEffect(() => {
    const applyEmbedSize = () => {
      const container = embedContainerRef.current;
      const embed = activeTabId ? webviewRefs.current.get(activeTabId) as HTMLElement | null : null;
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
  }, [activeTabId, isElectronRuntime]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const toggleDevTools = () => {
      if (!activeTabId || !isElectronRuntime) return;
      const webview = webviewRefs.current.get(activeTabId);
      if (webview && typeof (webview as any).openDevTools === 'function') {
        (webview as any).openDevTools();
      }
    };
    window.addEventListener('khoj-toggle-devtools', toggleDevTools);

    if (!isElectronRuntime) {
      return () => window.removeEventListener('khoj-toggle-devtools', toggleDevTools);
    }

    const handleNavCommand = (event: Event) => {
      const customEvent = event as CustomEvent<BrowserNavCommandDetail>;
      const command = customEvent.detail;
      if (!command || command.tabId !== activeTabId) return;

      const webview = activeTabId ? webviewRefs.current.get(activeTabId) : null;
      if (!webview) return;

      // Check if webview is ready (attached to DOM and dom-ready event emitted)
      const isWebviewReady = isElectronRuntime ? webviewReadyStates.current.get(activeTabId) || false : true;
      
      if (!isWebviewReady) {
        console.warn('Webview not ready for navigation command:', command.action);
        return;
      }

      try {
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
      } catch (error) {
        console.error('Error executing navigation command:', command.action, error);
      }
    };

    const handleWindowMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OPEN_LINK_IN_NEW_TAB' && event.data.data?.url) {
        onNewTabWithUrl?.(event.data.data.url);
        return;
      }
      if (event.data?.type === 'navigate' && event.data.url && activeTabId) {
        onTabNavigate?.(activeTabId, event.data.url);
      }
    };

    window.addEventListener(NAV_EVENT_NAME, handleNavCommand as EventListener);
    window.addEventListener('message', handleWindowMessage);

    return () => {
      window.removeEventListener('khoj-toggle-devtools', toggleDevTools);
      window.removeEventListener(NAV_EVENT_NAME, handleNavCommand as EventListener);
      window.removeEventListener('message', handleWindowMessage);
    };
  }, [activeTabId, isElectronRuntime, onNewTabWithUrl, onTabNavigate]);

  return (
    <View style={styles.browser}>
      {isIncognito && (
        <View style={[styles.incognitoIndicator, { backgroundColor: colors.buttonPrimary }]}>
          <Text style={[styles.incognitoText, { color: colors.buttonPrimaryText }]}>
            🔒 Incognito Mode
          </Text>
        </View>
      )}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={onTabClick}
        onTabClose={onTabClose}
        onNewTab={onNewTab}
      />
      
      <BookmarksBar
        visible={!isIncognito && (showBookmarksBar || false)}
        bookmarks={bookmarks}
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
        isBookmarked={isBookmarked}
        onBookmarkToggle={onBookmarkToggle}
        onPasswordManager={() => setShowPasswordManager(true)}
        onNewTab={onNewTab}
        onNewWindow={onNewWindow}
        onExit={onExit}
        onNavigateToPage={onNavigateToPage}
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
            {tabs.map(tab => (
              <View
                key={tab.id}
                style={{
                  ...tabContainerStyle,
                  display: tab.id === activeTabId ? 'flex' : 'none'
                }}
              >
                {isElectronRuntime ? (
                  <webview
                    ref={(el) => {
                      if (el) {
                        webviewRefs.current.set(tab.id, el);
                        webviewReadyStates.current.set(tab.id, false);
                        
                        // Add error event listener for Electron webview
                        el.addEventListener('did-fail-load', (event: any) => {
                          handleWebviewError(tab.id, {
                            code: event.errorCode,
                            description: event.errorDescription
                          });
                        });
                        el.addEventListener('did-load', () => {
                          handleWebviewLoad(tab.id);
                          handleFaviconUpdate(tab.id, tab.url);
                        });
                        el.addEventListener('did-navigate', (event: any) => {
                          if (event.url && onTabNavigate) {
                            onTabNavigate(tab.id, event.url, event.title);
                          }
                          const updatedTab = tabs.find(t => t.id === tab.id);
                          if (updatedTab && !isIncognito && event.url && !event.url.startsWith('khoj://') && !event.url.startsWith('data:')) {
                            try {
                              historyStorage.addHistoryItem({
                                title: event.title || updatedTab.title || event.url,
                                url: event.url,
                                icon: 'globe',
                                lastVisited: new Date().toLocaleString()
                              });
                            } catch (error) {
                              console.error('Error saving navigation to history:', error);
                            }
                          }
                        });
                        el.addEventListener('page-title-updated', (event: any) => {
                          if (event.title && onTabTitleUpdate) {
                            onTabTitleUpdate(tab.id, event.title);
                          }
                        });
                        el.addEventListener('dom-ready', () => {
                          webviewReadyStates.current.set(tab.id, true);
                          const pageUrl = (el as any).getURL?.() || tab.url;
                          void injectPasswordAutofill(el, pageUrl);
                          (el as any).executeJavaScript(`
                            document.addEventListener('auxclick', function(event) {
                              if (event.button === 1 && event.target.tagName === 'A') {
                                event.preventDefault();
                                event.stopPropagation();
                                const href = event.target.href;
                                if (href) {
                                  window.parent.postMessage({
                                    type: 'OPEN_LINK_IN_NEW_TAB',
                                    data: { url: href }
                                  }, '*');
                                }
                              }
                            });
                          `);
                        });
                      }
                    }}
                    src={toWebviewSrc(tab.url)}
                    style={webviewStyle as any}
                    allowpopups={true.toString() as any}
                    partition={isIncognito ? 'incognito' : ''}
                    webpreferences={`contextIsolation=true,nodeIntegration=false,enableRemoteModule=false,${isIncognito ? 'incognito=true' : ''}`}
                  />
                ) : (
                  <iframe
                    ref={(el) => {
                      if (el) {
                        webviewRefs.current.set(tab.id, el);
                        // Add error event listener for iframe
                        el.addEventListener('error', (event: any) => {
                          handleWebviewError(tab.id, {
                            code: -1,
                            description: 'Failed to load page'
                          });
                        });
                        el.addEventListener('load', () => {
                          handleWebviewLoad(tab.id);
                          handleFaviconUpdate(tab.id, tab.url);
                          
                          // Add middle-click handling for iframe links
                          const iframeDoc = el.contentDocument;
                          if (iframeDoc) {
                            iframeDoc.addEventListener('auxclick', (event: any) => {
                              if (event.button === 1 && event.target.tagName === 'A') {
                                event.preventDefault();
                                event.stopPropagation();
                                const href = event.target.href;
                                if (href) {
                                  if (onNewTabWithUrl) {
                                    onNewTabWithUrl(href);
                                  } else if (onNewTab) {
                                    onNewTab();
                                    console.log('Middle-clicked link:', href);
                                  }
                                }
                              }
                            });
                            
                            // Also monitor for navigation changes in iframe
                            const monitorNavigation = () => {
                              const currentUrl = (el as HTMLIFrameElement).contentWindow?.location.href;
                              const currentTitle = (el as HTMLIFrameElement).contentDocument?.title;
                              const currentTab = tabs.find(t => t.id === tab.id);
                              
                              if (currentTab && !isIncognito && currentUrl && currentUrl !== 'about:blank' && !currentUrl.startsWith('khoj://')) {
                                try {
                                  historyStorage.addHistoryItem({
                                    title: currentTitle || currentTab.title || currentUrl,
                                    url: currentUrl,
                                    icon: 'globe',
                                    lastVisited: new Date().toLocaleString()
                                  });
                                  console.log('Added to history (iframe):', { url: currentUrl, title: currentTitle });
                                } catch (error) {
                                  console.error('Error saving iframe navigation to history:', error);
                                }
                              }
                            };
                            
                            // Set up a MutationObserver to detect URL changes
                            const observer = new MutationObserver(monitorNavigation);
                            observer.observe(iframeDoc, { childList: true, subtree: true });
                          }
                        });
                        // Add download event listener for iframe
                      }
                    }}
                    title={tab.title || tab.url}
                    src={tab.url}
                    style={webviewStyle as any}
                  />
                )}
              </View>
            ))}
          </View>
        )}
      </View>
      
      <PasswordManager
        visible={showPasswordManager}
        onClose={() => setShowPasswordManager(false)}
        currentUrl={activeTab?.url}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  browser: {
    flex: 1,
    height: '100%',
  },
  incognitoIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incognitoText: {
    fontSize: 12,
    fontWeight: '600',
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
