interface BrowserTab {
    id: string;
    url: string;
    title: string;
    history: BrowserHistory[];
    historyIndex: number;
    isLoading: boolean;
    zoomLevel: number;
    isPrivate: boolean;
    isPinned: boolean;
    element: HTMLIFrameElement;
    favicon?: string;
    loadProgress: number;
    securityLevel: 'secure' | 'insecure' | 'mixed' | 'unknown';
}

interface BrowserHistory {
    url: string;
    title: string;
    timestamp: number;
}

interface Bookmark {
    id: string;
    url: string;
    title: string;
    favicon: string;
    folder: string;
    dateAdded: number;
    timestamp: number;
}

interface Download {
    id: string;
    url: string;
    filename: string;
    size: number;
    progress: number;
    status: 'downloading' | 'completed' | 'failed';
    timestamp: number;
}

interface BrowserSettings {
    homepage: string;
    searchEngine: 'google' | 'bing' | 'duckduckgo' | 'custom';
    customSearchUrl?: string;
    restoreSession: boolean;
    downloadPath: string;
    enableJavaScript: boolean;
    enableCookies: boolean;
    enablePopups: boolean;
    theme: 'light' | 'dark' | 'auto';
    defaultZoom: number;
}

interface BrowserSession {
    tabs: {
        id: string;
        url: string;
        title: string;
        isPinned: boolean;
    }[];
    activeTabId: string;
    windowState: {
        width: number;
        height: number;
        isMaximized: boolean;
    };
}

interface NetworkRequest {
    url: string;
    method: string;
    status: number;
    timestamp: number;
    duration: number;
}

interface BrowserExtension {
    id: string;
    name: string;
    version: string;
    description: string;
    enabled: boolean;
    permissions: string[];
    scripts: {
        content?: string;
        background?: string;
    };
}

interface PerformanceMetrics {
    timestamp: number;
    cpuUsage: number;
    memoryUsage: {
        used: number;
        total: number;
        percentage: number;
    };
    networkActivity: {
        requestsCount: number;
        bytesTransferred: number;
    };
    renderTime: number;
    activeTabs: number;
}

interface PageError {
    url: string;
    errorCode: string;
    errorMessage: string;
    timestamp: number;
    tabId: string;
    details?: {
        statusCode?: number;
        statusText?: string;
        contentType?: string;
        headers?: Record<string, string>;
        stack?: string;
    };
}

class KhojBrowser {
    private tabs: BrowserTab[] = [];
    private activeTabId: string = '';
    private bookmarks: Bookmark[] = [];
    private downloads: Download[] = [];
    private isPrivateMode: boolean = false;
    private networkRequests: NetworkRequest[] = [];
    private consoleMessages: string[] = [];
    private isMaximized: boolean = false;
    private settings!: BrowserSettings;
    private session!: BrowserSession;
    private draggedTab: string | null = null;
    private extensions: BrowserExtension[] = [];
    private performanceMetrics: PerformanceMetrics[] = [];
    private performanceMonitoringInterval: NodeJS.Timeout | null = null;
    private pageErrors: PageError[] = [];

    // UI Elements
    private tabsContainer!: HTMLElement;
    private webviewContainer!: HTMLElement;
    private urlBar!: HTMLInputElement;
    private backButton!: HTMLButtonElement;
    private forwardButton!: HTMLButtonElement;
    private reloadButton!: HTMLButtonElement;
    private homeButton!: HTMLButtonElement;
    private minimizeBtn!: HTMLButtonElement;
    private maximizeBtn!: HTMLButtonElement;
    private closeBtn!: HTMLButtonElement;
    private newTabBtn!: HTMLButtonElement;
    private bookmarkBtn!: HTMLButtonElement;
    private downloadsBtn!: HTMLButtonElement;
    private devToolsBtn!: HTMLButtonElement;
    private settingsBtn!: HTMLButtonElement;
    private statusText!: HTMLElement;
    private loadingIndicator!: HTMLElement;
    private urlDisplay!: HTMLElement;
    private errorMessage!: HTMLElement;
    private findBar!: HTMLElement;
    private findInput!: HTMLInputElement;
    private downloadsPanel!: HTMLElement;
    private devToolsPanel!: HTMLElement;
    private settingsPanel!: HTMLElement;
    private securityIndicator!: HTMLElement;
    private progressBar!: HTMLElement;
    private bookmarksBar!: HTMLElement;
    private bookmarksContainer!: HTMLElement;
    private bookmarksList!: HTMLElement;
    private bookmarksToggle!: HTMLButtonElement;
    private bookmarksManage!: HTMLButtonElement;
    private bookmarksAdd!: HTMLButtonElement;

    constructor() {
        this.initializeSettings();
        this.initializeElements();
        this.setupEventListeners();
        this.setupElectronEventListeners();
        this.loadInitialState();
        this.restoreSession();
        this.createTab('khoj://home');
        this.startPerformanceMonitoring();
    }

    private startPerformanceMonitoring(): void {
        // Collect performance metrics every 5 seconds
        this.performanceMonitoringInterval = setInterval(() => {
            this.collectPerformanceMetrics();
        }, 5000);
    }

    private stopPerformanceMonitoring(): void {
        if (this.performanceMonitoringInterval) {
            clearInterval(this.performanceMonitoringInterval);
            this.performanceMonitoringInterval = null;
        }
    }

    private collectPerformanceMetrics(): void {
        const metrics: PerformanceMetrics = {
            timestamp: Date.now(),
            cpuUsage: this.getCPUUsage(),
            memoryUsage: this.getMemoryUsage(),
            networkActivity: this.getNetworkActivity(),
            renderTime: this.getAverageRenderTime(),
            activeTabs: this.tabs.length
        };

        this.performanceMetrics.push(metrics);

        // Keep only last 100 metrics to prevent memory issues
        if (this.performanceMetrics.length > 100) {
            this.performanceMetrics.shift();
        }

        // Update dev tools if open
        this.updatePerformanceDisplay();
    }

    private getCPUUsage(): number {
        // Simple CPU usage estimation based on active operations
        const activeOperations = this.tabs.filter(tab => tab.isLoading).length;
        const networkRequests = this.networkRequests.filter(req => 
            Date.now() - req.timestamp < 5000
        ).length;
        
        return Math.min((activeOperations * 20) + (networkRequests * 5), 100);
    }

    private getMemoryUsage(): { used: number; total: number; percentage: number } {
        // Estimate memory usage based on tabs and cached data
        const estimatedMemoryPerTab = 50 * 1024 * 1024; // 50MB per tab
        const used = this.tabs.length * estimatedMemoryPerTab;
        const total = 2 * 1024 * 1024 * 1024; // 2GB estimated total
        const percentage = (used / total) * 100;

        return {
            used: used / 1024 / 1024, // Convert to MB
            total: total / 1024 / 1024, // Convert to MB
            percentage: Math.round(percentage)
        };
    }

    private getNetworkActivity(): { requestsCount: number; bytesTransferred: number } {
        const recentRequests = this.networkRequests.filter(req => 
            Date.now() - req.timestamp < 5000
        );
        
        return {
            requestsCount: recentRequests.length,
            bytesTransferred: recentRequests.reduce((total, req) => {
                // Estimate bytes based on URL length and status
                return total + req.url.length * 2 + 1024; // Rough estimate
            }, 0)
        };
    }

    private getAverageRenderTime(): number {
        // Simple render time estimation based on loading tabs
        const loadingTabs = this.tabs.filter(tab => tab.isLoading);
        if (loadingTabs.length === 0) return 0;

        // Estimate render time based on load progress
        return loadingTabs.reduce((total, tab) => {
            return total + ((1 - tab.loadProgress / 100) * 1000); // Inverse of progress
        }, 0) / loadingTabs.length;
    }

    private updatePerformanceDisplay(): void {
        if (this.devToolsPanel.style.display === 'none') return;

        const latestMetrics = this.performanceMetrics[this.performanceMetrics.length - 1];
        if (!latestMetrics) return;

        // Update performance display in dev tools
        const perfDisplay = document.getElementById('performance-display');
        if (perfDisplay) {
            perfDisplay.innerHTML = `
                <div class="perf-metric">
                    <span>CPU Usage:</span>
                    <span>${latestMetrics.cpuUsage.toFixed(1)}%</span>
                </div>
                <div class="perf-metric">
                    <span>Memory:</span>
                    <span>${latestMetrics.memoryUsage.used.toFixed(1)}MB (${latestMetrics.memoryUsage.percentage}%)</span>
                </div>
                <div class="perf-metric">
                    <span>Network:</span>
                    <span>${latestMetrics.networkActivity.requestsCount} requests</span>
                </div>
                <div class="perf-metric">
                    <span>Render Time:</span>
                    <span>${latestMetrics.renderTime.toFixed(1)}ms</span>
                </div>
                <div class="perf-metric">
                    <span>Active Tabs:</span>
                    <span>${latestMetrics.activeTabs}</span>
                </div>
            `;
        }
    }

    private getPerformanceReport(): string {
        if (this.performanceMetrics.length === 0) {
            return 'No performance data available.';
        }

        const latest = this.performanceMetrics[this.performanceMetrics.length - 1];
        const average = this.performanceMetrics.reduce((acc, metric) => ({
            cpuUsage: acc.cpuUsage + metric.cpuUsage,
            memoryPercentage: acc.memoryPercentage + metric.memoryUsage.percentage,
            renderTime: acc.renderTime + metric.renderTime
        }), { cpuUsage: 0, memoryPercentage: 0, renderTime: 0 });

        const count = this.performanceMetrics.length;
        
        return `
Performance Report (Last ${count} samples):
- Average CPU Usage: ${(average.cpuUsage / count).toFixed(1)}%
- Average Memory Usage: ${(average.memoryPercentage / count).toFixed(1)}%
- Average Render Time: ${(average.renderTime / count).toFixed(1)}ms
- Current Active Tabs: ${latest.activeTabs}
- Network Requests (last 5s): ${latest.networkActivity.requestsCount}
        `.trim();
    }

    private initializeSettings(): void {
        this.settings = {
            homepage: 'khoj://home',
            searchEngine: 'google',
            restoreSession: true,
            downloadPath: 'downloads',
            enableJavaScript: true,
            enableCookies: true,
            enablePopups: false,
            theme: 'light',
            defaultZoom: 1.0
        };
        
        this.session = {
            tabs: [],
            activeTabId: '',
            windowState: {
                width: 1200,
                height: 800,
                isMaximized: false
            }
        };
        
        this.loadSettings();
    }

    private initializeElements(): void {
        this.tabsContainer = document.getElementById('tabs-container')!;
        this.webviewContainer = document.getElementById('webview-container')!;
        this.urlBar = document.getElementById('url-bar') as HTMLInputElement;
        this.backButton = document.getElementById('back-btn') as HTMLButtonElement;
        this.forwardButton = document.getElementById('forward-btn') as HTMLButtonElement;
        this.reloadButton = document.getElementById('reload-btn') as HTMLButtonElement;
        this.homeButton = document.getElementById('home-btn') as HTMLButtonElement;
        this.minimizeBtn = document.getElementById('minimize-btn') as HTMLButtonElement;
        this.maximizeBtn = document.getElementById('maximize-btn') as HTMLButtonElement;
        this.closeBtn = document.getElementById('close-btn') as HTMLButtonElement;
        this.newTabBtn = document.getElementById('new-tab-btn') as HTMLButtonElement;
        this.bookmarkBtn = document.getElementById('bookmark-btn') as HTMLButtonElement;
        this.downloadsBtn = document.getElementById('downloads-btn') as HTMLButtonElement;
        this.devToolsBtn = document.getElementById('dev-tools-btn') as HTMLButtonElement;
        this.settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement;
        this.statusText = document.getElementById('status-text')!;
        this.loadingIndicator = document.getElementById('loading-indicator')!;
        this.urlDisplay = document.getElementById('url-display')!;
        this.errorMessage = document.getElementById('error-message')!;
        this.findBar = document.getElementById('find-bar')!;
        this.findInput = document.getElementById('find-input') as HTMLInputElement;
        this.downloadsPanel = document.getElementById('downloads-panel')!;
        this.devToolsPanel = document.getElementById('dev-tools-panel')!;
        this.settingsPanel = document.getElementById('settings-panel')!;
        this.securityIndicator = document.getElementById('security-indicator')!;
        this.progressBar = document.getElementById('progress-bar')!;
        this.bookmarksBar = document.getElementById('bookmarks-bar')!;
        this.bookmarksContainer = document.getElementById('bookmarks-container')!;
        this.bookmarksList = document.getElementById('bookmarks-list')!;
        this.bookmarksToggle = document.getElementById('bookmarks-toggle') as HTMLButtonElement;
        this.bookmarksManage = document.getElementById('bookmarks-manage') as HTMLButtonElement;
        this.bookmarksAdd = document.getElementById('bookmarks-add') as HTMLButtonElement;
    }

    private setupEventListeners(): void {
        // Window controls
        this.minimizeBtn.addEventListener('click', () => this.minimizeWindow());
        this.maximizeBtn.addEventListener('click', () => this.maximizeWindow());
        this.closeBtn.addEventListener('click', () => this.closeWindow());

        // Navigation
        this.backButton.addEventListener('click', () => this.goBack());
        this.forwardButton.addEventListener('click', () => this.goForward());
        this.reloadButton.addEventListener('click', () => this.reload());
        this.homeButton.addEventListener('click', () => this.goHome());
        this.newTabBtn.addEventListener('click', () => this.createTab());

        // URL bar
        this.urlBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.navigate();
        });

        // Find functionality
        document.getElementById('find-close-btn')!.addEventListener('click', () => this.hideFindBar());
        document.getElementById('find-next-btn')!.addEventListener('click', () => this.findNext());
        document.getElementById('find-prev-btn')!.addEventListener('click', () => this.findPrev());
        this.findInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.findNext();
        });

        // Other features
        this.bookmarkBtn.addEventListener('click', () => this.toggleBookmark());
        this.downloadsBtn.addEventListener('click', () => this.toggleDownloads());
        this.devToolsBtn.addEventListener('click', () => this.toggleDevTools());
        this.settingsBtn.addEventListener('click', () => this.toggleSettings());

        // Panel controls
        document.getElementById('downloads-close')!.addEventListener('click', () => this.hideDownloads());
        document.getElementById('dev-tools-close')!.addEventListener('click', () => this.hideDevTools());
        document.getElementById('settings-close')!.addEventListener('click', () => this.hideSettings());

        // Bookmarks bar
        this.bookmarksToggle.addEventListener('click', () => this.toggleBookmarksBar());
        this.bookmarksManage.addEventListener('click', () => this.toggleBookmarks());
        this.bookmarksAdd.addEventListener('click', () => this.addCurrentPageToBookmarks());

        // Dev tools tabs
        document.querySelectorAll('.dev-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const tabName = target.dataset.tab;
                if (tabName) this.switchDevToolsTab(tabName);
            });
        });

        // Console input
        document.getElementById('console-input')!.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                this.executeConsoleCommand(input.value);
                input.value = '';
            }
        });

        // Global message listener for iframe communication
        window.addEventListener('message', (event) => {
            this.handleMessage(event);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    private setupElectronEventListeners(): void {
        if (window.electronAPI) {
            // Menu actions from main process
            window.electronAPI.onNewTab(() => this.createTab());
            window.electronAPI.onCloseTab(() => this.closeTab(this.activeTabId));
            window.electronAPI.onPrintPage(() => this.printPage());
            window.electronAPI.onFind(() => this.showFindBar());
            window.electronAPI.onFindNext(() => this.findNext());
            window.electronAPI.onFindPrevious(() => this.findPrev());
            window.electronAPI.onReload(() => this.reload());
            window.electronAPI.onZoomReset(() => this.resetZoom());
            window.electronAPI.onZoomIn(() => this.zoomIn());
            window.electronAPI.onZoomOut(() => this.zoomOut());
            window.electronAPI.onToggleDevTools(() => this.toggleDevTools());
            window.electronAPI.onGoBack(() => this.goBack());
            window.electronAPI.onGoForward(() => this.goForward());
            window.electronAPI.onShowHistory(() => this.showHistory());
            window.electronAPI.onShowDownloads(() => this.toggleDownloads());
            window.electronAPI.onBookmarkPage(() => this.toggleBookmark());
            window.electronAPI.onImportBookmarks((filePath: string) => this.importBookmarks(filePath));
            window.electronAPI.onExportBookmarks((filePath: string) => this.exportBookmarks(filePath));

            // Listen for new tab requests from main process
            window.electronAPI.onOpenUrlInNewTab((url: string) => {
                this.createTab(url);
            });

            // Window state events
            window.electronAPI.onWindowMaximized(() => {
                this.isMaximized = true;
                this.updateMaximizeButton();
            });

            window.electronAPI.onWindowUnmaximized(() => {
                this.isMaximized = false;
                this.updateMaximizeButton();
            });
        }
    }

    private loadInitialState(): void {
        this.loadBookmarks();
        this.loadDownloads();
        this.loadExtensions();
    }

    private loadExtensions(): void {
        try {
            const saved = localStorage.getItem('browser_extensions');
            if (saved) {
                this.extensions = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Could not load extensions from localStorage:', error);
        }
    }

    private saveExtensions(): void {
        try {
            localStorage.setItem('browser_extensions', JSON.stringify(this.extensions));
        } catch (error) {
            console.warn('Could not save extensions to localStorage:', error);
        }
    }

    private installExtension(extensionData: Partial<BrowserExtension>): void {
        const extension: BrowserExtension = {
            id: extensionData.id || this.generateExtensionId(),
            name: extensionData.name || 'Unknown Extension',
            version: extensionData.version || '1.0.0',
            description: extensionData.description || '',
            enabled: true,
            permissions: extensionData.permissions || [],
            scripts: extensionData.scripts || {}
        };

        this.extensions.push(extension);
        this.saveExtensions();
        this.updateStatus(`Extension installed: ${extension.name}`);
    }

    private uninstallExtension(extensionId: string): void {
        const index = this.extensions.findIndex(ext => ext.id === extensionId);
        if (index >= 0) {
            const extension = this.extensions[index];
            this.extensions.splice(index, 1);
            this.saveExtensions();
            this.updateStatus(`Extension uninstalled: ${extension.name}`);
        }
    }

    private toggleExtension(extensionId: string): void {
        const extension = this.extensions.find(ext => ext.id === extensionId);
        if (extension) {
            extension.enabled = !extension.enabled;
            this.saveExtensions();
            this.updateStatus(`Extension ${extension.enabled ? 'enabled' : 'disabled'}: ${extension.name}`);
        }
    }

    private executeExtensionScripts(tabId: string): void {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        this.extensions
            .filter(ext => ext.enabled && ext.scripts.content)
            .forEach(extension => {
                try {
                    const doc = tab.element.contentDocument;
                    if (doc && doc.head) {
                        const script = doc.createElement('script');
                        script.textContent = extension.scripts.content || '';
                        doc.head.appendChild(script);
                    }
                } catch (error) {
                    console.warn(`Could not execute script for extension ${extension.name}:`, error);
                }
            });
    }

    private generateExtensionId(): string {
        return 'ext-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    private handleMessage(event: MessageEvent): void {
        const { type, url, tabId } = event.data;
        
        switch (type) {
            case 'open-link':
                if (url) {
                    this.createTab(url);
                }
                break;
            case 'url-changed':
                if (url && tabId) {
                    this.updateTabUrl(tabId, url);
                }
                break;
            case 'get-home-stats':
            case 'navigate-home-search':
            case 'open-new-tab':
            case 'open-settings':
                this.handleHomeMessages(event);
                break;
        }
    }

    private handleTabLoad(tabId: string): void {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        try {
            // Try to inject the navigation interception script
            const doc = tab.element.contentDocument;
            if (doc) {
                const script = doc.createElement('script');
                script.textContent = `
                    (function() {
                        // Intercept all link clicks
                        document.addEventListener('click', function(e) {
                            const link = e.target.closest('a');
                            if (link && link.href && link.target === '_blank') {
                                e.preventDefault();
                                window.parent.postMessage({
                                    type: 'open-link',
                                    url: link.href,
                                    tabId: '${tabId}'
                                }, '*');
                            }
                        });

                        // Intercept window.open calls
                        const originalOpen = window.open;
                        window.open = function(url, target, features) {
                            if (target === '_blank' || (!target && url)) {
                                window.parent.postMessage({
                                    type: 'open-link',
                                    url: url,
                                    tabId: '${tabId}'
                                }, '*');
                                return null;
                            }
                            return originalOpen.call(this, url, target, features);
                        };

                        // Monitor URL changes
                        let currentUrl = location.href;
                        const checkUrlChange = () => {
                            if (location.href !== currentUrl) {
                                currentUrl = location.href;
                                window.parent.postMessage({
                                    type: 'url-changed',
                                    url: currentUrl,
                                    tabId: '${tabId}'
                                }, '*');
                            }
                        };

                        // Override pushState and replaceState
                        const originalPushState = history.pushState;
                        const originalReplaceState = history.replaceState;
                        
                        history.pushState = function() {
                            originalPushState.apply(this, arguments);
                            checkUrlChange();
                        };
                        
                        history.replaceState = function() {
                            originalReplaceState.apply(this, arguments);
                            checkUrlChange();
                        };

                        window.addEventListener('popstate', checkUrlChange);
                    })();
                `;
                doc.head.appendChild(script);
            }
        } catch (error) {
            // Cross-origin restriction - this is expected for external sites
            console.log('Cannot inject script due to same-origin policy:', error);
        }

        this.showLoading(false, tabId);
    }

    private updateTabUrl(tabId: string, url: string): void {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        tab.url = url;
        
        // Update URL bar if this is the active tab
        if (tabId === this.activeTabId) {
            this.urlBar.value = url;
            this.urlDisplay.textContent = url;
            this.updateSecurityIndicator(url);
        }
        
        this.updateNavigationButtons();
    }

    private generateTabId(): string {
        return 'tab-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    private createTab(url: string = 'about:blank'): void {
        const tabId = this.generateTabId();
        const webview = document.createElement('iframe');
        webview.className = 'webview';
        webview.id = tabId;
        // No sandbox for now to allow external sites to load
        // We'll add proper security handling later
        
        // Add load event listener to handle navigation
        webview.addEventListener('load', () => {
            this.handleTabLoad(tabId);
        });
        
        const tab: BrowserTab = {
            id: tabId,
            url: url,
            title: 'New Tab',
            history: [],
            historyIndex: -1,
            isLoading: false,
            zoomLevel: 1.0,
            isPrivate: this.isPrivateMode,
            isPinned: false,
            element: webview,
            loadProgress: 0,
            securityLevel: 'unknown'
        };

        this.tabs.push(tab);
        this.webviewContainer.appendChild(webview);
        this.createTabElement(tab);
        this.switchToTab(tabId);
        
        if (url !== 'about:blank') {
            this.loadUrlInTab(tabId, url);
        }
    }

    private createTabElement(tab: BrowserTab): void {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        if (tab.isPinned) tabElement.classList.add('pinned');
        tabElement.id = 'tab-' + tab.id;
        tabElement.draggable = true;
        
        const favicon = document.createElement('div');
        favicon.className = 'tab-favicon';
        if (tab.favicon) {
            favicon.style.backgroundImage = `url(${tab.favicon})`;
            favicon.style.backgroundSize = 'contain';
        }
        
        const title = document.createElement('span');
        title.className = 'tab-title';
        title.textContent = tab.title;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'tab-close';
        
        // Create Ionicon element for close button
        const icon = document.createElement('ion-icon');
        icon.setAttribute('name', 'close-outline');
        closeBtn.appendChild(icon);
        
        closeBtn.style.display = tab.isPinned ? 'none' : 'block';
        
        tabElement.appendChild(favicon);
        tabElement.appendChild(title);
        tabElement.appendChild(closeBtn);

        // Tab events
        tabElement.addEventListener('click', (e) => {
            if (!(e.target as HTMLElement).classList.contains('tab-close')) {
                this.switchToTab(tab.id);
            }
        });

        tabElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showTabContextMenu(e, tab);
        });

        tabElement.addEventListener('dragstart', (e) => {
            this.draggedTab = tab.id;
            e.dataTransfer!.effectAllowed = 'move';
        });

        tabElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer!.dropEffect = 'move';
        });

        tabElement.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedTab && this.draggedTab !== tab.id) {
                this.reorderTabs(this.draggedTab, tab.id);
            }
            this.draggedTab = null;
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(tab.id);
        });

        // Insert before the new tab button
        this.tabsContainer.insertBefore(tabElement, this.newTabBtn);
    }

    private switchToTab(tabId: string): void {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        // Hide all tabs and webviews
        this.tabs.forEach(t => {
            document.getElementById('tab-' + t.id)!.classList.remove('active');
            t.element.classList.remove('active');
        });

        // Show selected tab and webview
        document.getElementById('tab-' + tabId)!.classList.add('active');
        tab.element.classList.add('active');
        this.activeTabId = tabId;

        this.updateUI();
        this.saveSession();
    }

    private loadUrlInTab(tabId: string, url: string): void {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        // Handle special khoj://home URL
        if (url === 'khoj://home') {
            this.loadWelcomePage(tabId);
            return;
        }

        this.showLoading(true, tabId);
        this.hideError();
        
        try {
            // Set up error handling for the iframe
            tab.element.addEventListener('error', (event: Event) => {
                this.handlePageLoadError(tabId, url, 'LOAD_ERROR', 'Failed to load page', event);
            });

            // Set up load success handler
            tab.element.addEventListener('load', () => {
                this.handlePageLoadSuccess(tabId, url);
            });

            // Try to load the URL
            tab.element.src = url;
            tab.url = url;
            tab.isLoading = true;
            
            // Set a timeout for page loading
            setTimeout(() => {
                if (tab.isLoading) {
                    this.handlePageLoadError(tabId, url, 'TIMEOUT', 'Page load timeout', null);
                }
            }, 30000); // 30 second timeout
            
            if (tabId === this.activeTabId) {
                this.urlBar.value = url;
                this.urlDisplay.textContent = url;
                this.updateSecurityIndicator(url);
            }
            
            this.updateNavigationButtons();
        } catch (error) {
            this.handlePageLoadError(tabId, url, 'EXCEPTION', 'Exception occurred while loading page', error as Error);
        }
    }

    private handlePageLoadSuccess(tabId: string, url: string): void {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        tab.isLoading = false;
        this.showLoading(false, tabId);
        
        // Update tab title
        try {
            if (tab.element.contentDocument && tab.element.contentDocument.title) {
                tab.title = tab.element.contentDocument.title;
                this.updateTabTitle(tabId, tab.title);
            }
        } catch (error) {
            // Cross-origin restriction - use URL as title
            tab.title = new URL(url).hostname;
            this.updateTabTitle(tabId, tab.title);
        }

        // Execute extension scripts
        this.executeExtensionScripts(tabId);
        
        // Update navigation buttons
        this.updateNavigationButtons();
        
        // Add to history
        this.addToHistory(tabId, url, tab.title);
    }

    private handlePageLoadError(tabId: string, url: string, errorCode: string, errorMessage: string, error: Event | Error | null): void {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        tab.isLoading = false;
        this.showLoading(false, tabId);

        // Create error details
        const pageError: PageError = {
            url,
            errorCode,
            errorMessage,
            timestamp: Date.now(),
            tabId,
            details: {
                statusCode: this.extractStatusCode(error),
                statusText: this.extractStatusText(error),
                contentType: this.extractContentType(error),
                stack: error instanceof Error ? error.stack : undefined
            }
        };

        // Store error
        this.pageErrors.push(pageError);
        
        // Keep only last 50 errors
        if (this.pageErrors.length > 50) {
            this.pageErrors.shift();
        }

        // Show error page
        this.showErrorPage(tabId, pageError);
        
        // Update UI
        this.showError(`Failed to load ${url}: ${errorMessage}`);
        tab.title = `Error: ${errorCode}`;
        this.updateTabTitle(tabId, tab.title);
    }

    private extractStatusCode(error: Event | Error | null): number | undefined {
        // Try to extract status code from error event
        if (error && error instanceof Event && (error.target as any)?.status) {
            return (error.target as any).status;
        }
        return undefined;
    }

    private extractStatusText(error: Event | Error | null): string | undefined {
        // Try to extract status text from error event
        if (error && error instanceof Event && (error.target as any)?.statusText) {
            return (error.target as any).statusText;
        }
        return undefined;
    }

    private extractContentType(error: Event | Error | null): string | undefined {
        // Try to extract content type from error event
        if (error && error instanceof Event && (error.target as any)?.contentType) {
            return (error.target as any).contentType;
        }
        return undefined;
    }

    private showErrorPage(tabId: string, pageError: PageError): void {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        // Generate error page HTML
        const errorPageHtml = this.generateErrorPageHtml(pageError);
        
        // Create a blob URL for the error page
        const blob = new Blob([errorPageHtml], { type: 'text/html' });
        const errorPageUrl = URL.createObjectURL(blob);
        
        // Load the error page
        tab.element.src = errorPageUrl;
        
        // Clean up blob URL after loading
        setTimeout(() => {
            URL.revokeObjectURL(errorPageUrl);
        }, 1000);
    }

    private generateErrorPageHtml(pageError: PageError): string {
        const timestamp = new Date(pageError.timestamp).toLocaleString();
        const errorSuggestions = this.getErrorSuggestions(pageError.errorCode);
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Khoj - Page Load Error</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .error-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 600px;
            width: 100%;
            overflow: hidden;
        }
        
        .error-header {
            background: #f8f9fa;
            padding: 24px;
            text-align: center;
            border-bottom: 1px solid #e9ecef;
        }
        
        .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        
        .error-title {
            font-size: 24px;
            font-weight: 600;
            color: #343a40;
            margin-bottom: 8px;
        }
        
        .error-subtitle {
            color: #6c757d;
            font-size: 16px;
        }
        
        .error-details {
            padding: 24px;
        }
        
        .error-info {
            background: #f8f9fa;
            border-left: 4px solid #dc3545;
            padding: 16px;
            margin-bottom: 20px;
            border-radius: 0 4px 4px 0;
        }
        
        .error-code {
            font-family: 'Courier New', monospace;
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: 600;
            color: #dc3545;
        }
        
        .error-url {
            word-break: break-all;
            color: #495057;
            font-size: 14px;
            margin: 8px 0;
        }
        
        .error-time {
            color: #6c757d;
            font-size: 12px;
            margin-top: 8px;
        }
        
        .suggestions {
            margin-top: 24px;
        }
        
        .suggestions h3 {
            font-size: 18px;
            margin-bottom: 12px;
            color: #343a40;
        }
        
        .suggestion-list {
            list-style: none;
        }
        
        .suggestion-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            align-items: center;
        }
        
        .suggestion-list li:last-child {
            border-bottom: none;
        }
        
        .suggestion-list li::before {
            content: "â¢";
            color: #28a745;
            font-weight: bold;
            margin-right: 12px;
        }
        
        .actions {
            padding: 20px 24px;
            background: #f8f9fa;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-primary {
            background: #007bff;
            color: white;
        }
        
        .btn-primary:hover {
            background: #0056b3;
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #545b62;
        }
        
        .technical-details {
            margin-top: 20px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #495057;
            max-height: 200px;
            overflow-y: auto;
        }
        
        .toggle-details {
            background: none;
            border: none;
            color: #007bff;
            cursor: pointer;
            font-size: 14px;
            padding: 8px 0;
            text-decoration: underline;
        }
        
        .toggle-details:hover {
            color: #0056b3;
        }
        
        @media (max-width: 480px) {
            .error-container {
                margin: 0;
                border-radius: 0;
            }
            
            .actions {
                flex-direction: column;
            }
            
            .btn {
                width: 100%;
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-header">
            <div class="error-icon">â ï¸</div>
            <h1 class="error-title">Unable to Load Page</h1>
            <p class="error-subtitle">Khoj couldn't load this page</p>
        </div>
        
        <div class="error-details">
            <div class="error-info">
                <strong>Error Code:</strong> <span class="error-code">${pageError.errorCode}</span><br>
                <strong>Message:</strong> ${pageError.errorMessage}<br>
                <strong>URL:</strong> <div class="error-url">${pageError.url}</div>
                <div class="error-time">Time: ${timestamp}</div>
            </div>
            
            <div class="suggestions">
                <h3>What you can try:</h3>
                <ul class="suggestion-list">
                    ${errorSuggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                </ul>
            </div>
            
            <button class="toggle-details" onclick="document.getElementById('technical-details').style.display = document.getElementById('technical-details').style.display === 'none' ? 'block' : 'none'">
                Show Technical Details
            </button>
            
            <div id="technical-details" class="technical-details" style="display: none;">
                <strong>Technical Information:</strong><br>
                Error Code: ${pageError.errorCode}<br>
                Error Message: ${pageError.errorMessage}<br>
                URL: ${pageError.url}<br>
                Tab ID: ${pageError.tabId}<br>
                Timestamp: ${pageError.timestamp}<br>
                ${pageError.details?.statusCode ? `Status Code: ${pageError.details.statusCode}<br>` : ''}
                ${pageError.details?.statusText ? `Status Text: ${pageError.details.statusText}<br>` : ''}
                ${pageError.details?.contentType ? `Content Type: ${pageError.details.contentType}<br>` : ''}
                ${pageError.details?.stack ? `Stack Trace:<br>${pageError.details.stack}` : ''}
            </div>
        </div>
        
        <div class="actions">
            <button class="btn btn-primary" onclick="window.location.reload()">
                â Try Again
            </button>
            <button class="btn btn-secondary" onclick="window.history.back()">
                â Go Back
            </button>
            <button class="btn btn-secondary" onclick="window.open('${pageError.url}', '_blank')">
                â Open in External Browser
            </button>
        </div>
    </div>
    
    <script>
        // Auto-retry functionality
        let retryCount = 0;
        const maxRetries = 3;
        
        function autoRetry() {
            if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(() => {
                    window.location.reload();
                }, 5000 * retryCount); // Exponential backoff
            }
        }
        
        // Start auto-retry for certain error types
        if ('${pageError.errorCode}' === 'TIMEOUT' || '${pageError.errorCode}' === 'NETWORK_ERROR') {
            autoRetry();
        }
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                window.location.reload();
            }
            if (e.key === 'Backspace' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                window.history.back();
            }
        });
    </script>
</body>
</html>
        `;
    }

    private getErrorSuggestions(errorCode: string): string[] {
        const suggestions: Record<string, string[]> = {
            'ERR_BLOCKED_BY_RESPONSE': [
                'The page is blocking access due to security policies',
                'Try opening the page in an external browser',
                'Check if the URL is correct and accessible',
                'Disable browser extensions that might interfere'
            ],
            'TIMEOUT': [
                'The page took too long to load',
                'Check your internet connection',
                'Try again with a more stable connection',
                'The server might be temporarily unavailable'
            ],
            'NETWORK_ERROR': [
                'Network connection issues detected',
                'Check your internet connectivity',
                'Try reloading the page',
                'Verify the URL is correct'
            ],
            'LOAD_ERROR': [
                'Failed to load the page content',
                'The page might not exist or be temporarily unavailable',
                'Check the URL for typos',
                'Try accessing the page directly'
            ],
            'EXCEPTION': [
                'An unexpected error occurred',
                'Try reloading the page',
                'Clear browser cache and try again',
                'Report this issue if it persists'
            ]
        };

        return suggestions[errorCode] || [
            'An error occurred while loading the page',
            'Try reloading the page',
            'Check your internet connection',
            'Verify the URL is correct'
        ];
    }

    private updateTabTitle(tabId: string, title: string): void {
        const tabElement = document.getElementById('tab-' + tabId);
        if (tabElement) {
            const titleElement = tabElement.querySelector('.tab-title');
            if (titleElement) {
                titleElement.textContent = title;
            }
        }
    }

    private generateWelcomePageHtml(): string {
        const currentTime = new Date().toLocaleString();
        const browserVersion = '1.0.0';
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Khoj</title>
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
            overflow-x: hidden;
        }
        
        .container {
            max-width: 1200px;
            width: 100%;
            padding: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            align-items: center;
        }
        
        .welcome-section {
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 72px;
            font-weight: 700;
            margin-bottom: 20px;
            background: linear-gradient(45deg, #fff, #f8f9fa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 2px 20px rgba(0,0,0,0.1);
        }
        
        .tagline {
            font-size: 24px;
            font-weight: 300;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        
        .description {
            font-size: 18px;
            line-height: 1.6;
            opacity: 0.8;
            margin-bottom: 40px;
            max-width: 500px;
        }
        
        .features-section {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        
        .features-title {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 30px;
            color: #343a40;
            text-align: center;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .feature-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            transition: all 0.3s ease;
            border: 1px solid #e9ecef;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-color: #667eea;
        }
        
        .feature-icon {
            font-size: 36px;
            color: #667eea;
            margin-bottom: 16px;
        }
        
        .feature-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #343a40;
        }
        
        .feature-description {
            font-size: 14px;
            color: #6c757d;
            line-height: 1.5;
        }
        
        .quick-actions {
            margin-top: 40px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            align-items: center;
        }
        
        .search-container {
            position: relative;
            width: 100%;
            max-width: 500px;
        }
        
        .search-input {
            width: 100%;
            padding: 16px 20px 16px 50px;
            border: none;
            border-radius: 50px;
            font-size: 16px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .search-input:focus {
            outline: none;
            background: rgba(255, 255, 255, 1);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }
        
        .search-icon {
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            color: #667eea;
            font-size: 20px;
        }
        
        .action-buttons {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
        }
        
        .btn-primary {
            background: #667eea;
            color: white;
        }
        
        .btn-primary:hover {
            background: #5a67d8;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        
        .btn-secondary {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
        }
        
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        
        .stats {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-top: 30px;
            flex-wrap: wrap;
        }
        
        .stat-item {
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .stat-number {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
        }
        
        .stat-label {
            font-size: 14px;
            opacity: 0.8;
        }
        
        .footer {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
        }
        
        .floating-shapes {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: -1;
        }
        
        .shape {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            animation: float 6s ease-in-out infinite;
        }
        
        .shape:nth-child(1) {
            width: 200px;
            height: 200px;
            top: 10%;
            left: 10%;
            animation-delay: 0s;
        }
        
        .shape:nth-child(2) {
            width: 150px;
            height: 150px;
            top: 70%;
            right: 10%;
            animation-delay: 2s;
        }
        
        .shape:nth-child(3) {
            width: 100px;
            height: 100px;
            top: 20%;
            right: 20%;
            animation-delay: 4s;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        
        @media (max-width: 768px) {
            .container {
                grid-template-columns: 1fr;
                gap: 20px;
                padding: 10px;
            }
            
            .logo {
                font-size: 48px;
            }
            
            .tagline {
                font-size: 20px;
            }
            
            .description {
                font-size: 16px;
            }
            
            .features-section {
                padding: 30px 20px;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
            }
            
            .action-buttons {
                flex-direction: column;
                width: 100%;
            }
            
            .btn {
                width: 100%;
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="floating-shapes">
        <div class="shape"></div>
        <div class="shape"></div>
        <div class="shape"></div>
    </div>
    
    <div class="container">
        <div class="welcome-section">
            <div class="logo">KHOJ</div>
            <h1 class="tagline">Discover the Web, Your Way</h1>
            <p class="description">
                A modern, secure, and lightning-fast browser built for the ultimate web experience. 
                Browse smarter with advanced features and intuitive design.
            </p>
            
            <div class="quick-actions">
                <div class="search-container">
                    <ion-icon name="search" class="search-icon"></ion-icon>
                    <input type="text" class="search-input" placeholder="Search the web or enter a URL..." id="home-search">
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="navigateToSearch()">
                        <ion-icon name="search"></ion-icon>
                        Search
                    </button>
                    <button class="btn btn-secondary" onclick="openNewTab()">
                        <ion-icon name="add"></ion-icon>
                        New Tab
                    </button>
                    <button class="btn btn-secondary" onclick="openSettings()">
                        <ion-icon name="settings"></ion-icon>
                        Settings
                    </button>
                </div>
            </div>
            
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-number" id="tab-count">1</div>
                    <div class="stat-label">Active Tabs</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" id="bookmark-count">0</div>
                    <div class="stat-label">Bookmarks</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" id="download-count">0</div>
                    <div class="stat-label">Downloads</div>
                </div>
            </div>
        </div>
        
        <div class="features-section">
            <h2 class="features-title">Powerful Features</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <ion-icon name="shield-checkmark"></ion-icon>
                    </div>
                    <h3 class="feature-title">Secure Browsing</h3>
                    <p class="feature-description">
                        Advanced security indicators and protection against malicious websites
                    </p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">
                        <ion-icon name="speedometer"></ion-icon>
                    </div>
                    <h3 class="feature-title">Lightning Fast</h3>
                    <p class="feature-description">
                        Optimized performance with intelligent caching and resource management
                    </p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">
                        <ion-icon name="extension-puzzle"></ion-icon>
                    </div>
                    <h3 class="feature-title">Extensible</h3>
                    <p class="feature-description">
                        Support for browser extensions to enhance your browsing experience
                    </p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">
                        <ion-icon name="bookmarks"></ion-icon>
                    </div>
                    <h3 class="feature-title">Smart Bookmarks</h3>
                    <p class="feature-description">
                        Organize and sync your bookmarks across sessions with intelligent search
                    </p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">
                        <ion-icon name="code</ion-icon>
                    </div>
                    <h3 class="feature-title">Developer Tools</h3>
                    <p class="feature-description">
                        Built-in developer tools for debugging and web development
                    </p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">
                        <ion-icon name="time"></ion-icon>
                    </div>
                    <h3 class="feature-title">Session Restore</h3>
                    <p class="feature-description">
                        Automatically restore your tabs and windows after restart
                    </p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p>Khoj Browser v${browserVersion} â¢ Made with â¤ï¸ for the modern web</p>
    </div>
    
    <script>
        // Initialize stats
        function updateStats() {
            // Send message to parent window to get stats
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'get-home-stats',
                    timestamp: Date.now()
                }, '*');
            }
        }
        
        // Handle search
        function navigateToSearch() {
            const searchInput = document.getElementById('home-search');
            const query = searchInput.value.trim();
            
            if (query) {
                // Send message to parent window to navigate
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                        type: 'navigate-home-search',
                        query: query,
                        timestamp: Date.now()
                    }, '*');
                }
            }
        }
        
        // Handle new tab
        function openNewTab() {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'open-new-tab',
                    timestamp: Date.now()
                }, '*');
            }
        }
        
        // Handle settings
        function openSettings() {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'open-settings',
                    timestamp: Date.now()
                }, '*');
            }
        }
        
        // Search on Enter key
        document.getElementById('home-search').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                navigateToSearch();
            }
        });
        
        // Listen for stats updates
        window.addEventListener('message', function(event) {
            if (event.data.type === 'home-stats-update') {
                document.getElementById('tab-count').textContent = event.data.tabs || '1';
                document.getElementById('bookmark-count').textContent = event.data.bookmarks || '0';
                document.getElementById('download-count').textContent = event.data.downloads || '0';
            }
        });
        
        // Initialize on load
        document.addEventListener('DOMContentLoaded', function() {
            updateStats();
            
            // Update stats every 5 seconds
            setInterval(updateStats, 5000);
        });
        
        // Add some interactive animations
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
        
        // Parallax effect on mouse move
        document.addEventListener('mousemove', function(e) {
            const shapes = document.querySelectorAll('.shape');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 20;
                shape.style.transform = \`translate(\${x * speed}px, \${y * speed}px)\`;
            });
        });
    </script>
</body>
</html>
        `;
    }

    private formatUrl(url: string): string {
        if (!url) return '';
        
        // Trim whitespace
        url = url.trim();
        
        // Check if it's already a valid URL
        if (this.isValidUrl(url)) {
            return url;
        }
        
        // Check if it's a search query
        if (this.isSearchQuery(url)) {
            return this.getSearchUrl(url);
        }
        
        // Check if it's likely a domain
        if (this.isLikelyDomain(url)) {
            return `https://${url}`;
        }
        
        // Default to search
        return this.getSearchUrl(url);
    }

    private loadWelcomePage(tabId: string): void {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        // Generate welcome page HTML
        const welcomePageHtml = this.generateWelcomePageHtml();
        
        // Create a blob URL for the welcome page
        const blob = new Blob([welcomePageHtml], { type: 'text/html' });
        const welcomePageUrl = URL.createObjectURL(blob);
        
        // Load the welcome page
        tab.element.src = welcomePageUrl;
        tab.url = 'khoj://home';
        tab.title = 'Welcome to Khoj';
        tab.isLoading = false;
        
        // Update UI
        this.updateTabTitle(tabId, tab.title);
        this.showLoading(false, tabId);
        
        // Clean up blob URL after loading
        setTimeout(() => {
            URL.revokeObjectURL(welcomePageUrl);
        }, 1000);
    }

    private handleHomeMessages(event: MessageEvent): void {
        const { type, query, timestamp } = event.data;
        
        switch (type) {
            case 'get-home-stats':
                this.sendHomeStats();
                break;
            case 'navigate-home-search':
                if (query) {
                    this.navigateFromHome(query);
                }
                break;
            case 'open-new-tab':
                this.createTab();
                break;
            case 'open-settings':
                this.toggleSettings();
                break;
        }
    }

    private sendHomeStats(): void {
        const stats = {
            tabs: this.tabs.length,
            bookmarks: this.bookmarks.length,
            downloads: this.downloads.length
        };

        // Send stats to all iframes (in case home page is open in multiple tabs)
        this.tabs.forEach(tab => {
            try {
                if (tab.element.contentWindow && tab.url === 'khoj://home') {
                    tab.element.contentWindow.postMessage({
                        type: 'home-stats-update',
                        ...stats,
                        timestamp: Date.now()
                    }, '*');
                }
            } catch (error) {
                // Cross-origin restriction, ignore
            }
        });
    }

    private navigateFromHome(query: string): void {
        const url = this.formatUrl(query);
        this.loadUrlInTab(this.activeTabId, url);
    }

    private isValidUrl(url: string): boolean {
        try {
            const urlObj = new URL(url);
            return ['http:', 'https:'].includes(urlObj.protocol);
        } catch {
            return false;
        }
    }

    private isSearchQuery(url: string): boolean {
        // Contains spaces, or starts with search keywords
        const searchKeywords = ['search', 'find', 'lookup', 'google', 'bing', 'duckduckgo'];
        const hasSpaces = url.includes(' ');
        const startsWithSearch = searchKeywords.some(keyword => 
            url.toLowerCase().startsWith(keyword + ' ') || 
            url.toLowerCase() === keyword
        );
        
        return hasSpaces || startsWithSearch;
    }

    private isLikelyDomain(url: string): boolean {
        // Basic domain pattern check
        const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        const hasDot = url.includes('.');
        const noSpaces = !url.includes(' ');
        
        return (hasDot || url.length > 3) && noSpaces && domainPattern.test(url);
    }

    private getSearchUrl(query: string): string {
        const searchEngines: Record<string, string> = {
            google: 'https://www.google.com/search?q=',
            bing: 'https://www.bing.com/search?q=',
            duckduckgo: 'https://duckduckgo.com/?q=',
            custom: this.settings.customSearchUrl || 'https://www.google.com/search?q='
        };

        const engine = this.settings.searchEngine;
        const baseUrl = searchEngines[engine];
        
        return baseUrl + encodeURIComponent(query);
    }

    private updateSecurityIndicator(url: string): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;

        try {
            const urlObj = new URL(url);
            
            if (urlObj.protocol === 'https:') {
                tab.securityLevel = 'secure';
                this.securityIndicator.style.color = '#34a853';
                this.securityIndicator.textContent = '»';
            } else if (urlObj.protocol === 'http:') {
                tab.securityLevel = 'insecure';
                this.securityIndicator.style.color = '#fbbc04';
                this.securityIndicator.textContent = '!';
            } else {
                tab.securityLevel = 'unknown';
                this.securityIndicator.style.color = '#5f6368';
                this.securityIndicator.textContent = '?';
            }
        } catch {
            tab.securityLevel = 'unknown';
            this.securityIndicator.style.color = '#5f6368';
            this.securityIndicator.textContent = '?';
        }
    }

    private navigate(): void {
        const url = this.urlBar.value.trim();
        if (!url) return;

        const formattedUrl = this.formatUrl(url);
        this.loadUrlInTab(this.activeTabId, formattedUrl);
    }

    private goBack(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab || tab.historyIndex <= 0) return;

        tab.historyIndex--;
        const previousPage = tab.history[tab.historyIndex];
        this.loadUrlInTab(tab.id, previousPage.url);
    }

    private goForward(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab || tab.historyIndex >= tab.history.length - 1) return;

        tab.historyIndex++;
        const nextPage = tab.history[tab.historyIndex];
        this.loadUrlInTab(tab.id, nextPage.url);
    }

    private reload(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab || !tab.url) return;

        tab.element.src = tab.url;
        this.showLoading(true, tab.id);
    }

    private goHome(): void {
        this.loadUrlInTab(this.activeTabId, this.settings.homepage);
    }

    private showFindBar(): void {
        this.findBar.style.display = 'flex';
        this.findInput.focus();
    }

    private hideFindBar(): void {
        this.findBar.style.display = 'none';
        this.findInput.value = '';
    }

    private findNext(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;

        const searchTerm = this.findInput.value;
        if (!searchTerm) return;

        try {
            const webview = tab.element;
            if (webview.contentWindow) {
                (webview.contentWindow as any).find(searchTerm);
            }
        } catch (error) {
            console.warn('Cannot search in iframe due to same-origin policy');
        }
    }

    private findPrev(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;

        const searchTerm = this.findInput.value;
        if (!searchTerm) return;

        try {
            const webview = tab.element;
            if (webview.contentWindow) {
                (webview.contentWindow as any).find(searchTerm, false, true);
            }
        } catch (error) {
            console.warn('Cannot search in iframe due to same-origin policy');
        }
    }

    private zoomIn(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;

        tab.zoomLevel = Math.min(tab.zoomLevel + 0.1, 2.0);
        this.applyZoom(tab);
    }

    private zoomOut(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;

        tab.zoomLevel = Math.max(tab.zoomLevel - 0.1, 0.5);
        this.applyZoom(tab);
    }

    private resetZoom(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;

        tab.zoomLevel = 1.0;
        this.applyZoom(tab);
    }

    private applyZoom(tab: BrowserTab): void {
        tab.element.style.transform = `scale(${tab.zoomLevel})`;
        tab.element.style.transformOrigin = 'top left';
    }

    private printPage(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;

        try {
            tab.element.contentWindow?.print();
        } catch (error) {
            this.showError('Cannot print due to security restrictions');
        }
    }

    private toggleBookmark(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab || !tab.url) return;

        const existingIndex = this.bookmarks.findIndex(b => b.url === tab.url);
        
        if (existingIndex >= 0) {
            this.bookmarks.splice(existingIndex, 1);
            this.updateStatus('Bookmark removed');
        } else {
            const bookmark: Bookmark = {
                url: tab.url,
                title: tab.title,
                timestamp: Date.now()
            };
            this.bookmarks.push(bookmark);
            this.updateStatus('Bookmark added');
        }
        
        this.saveBookmarks();
        this.updateBookmarkButton();
    }

    private showHistory(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;

        const historyList = tab.history
            .slice()
            .reverse()
            .map((entry, index) => `${index + 1}. ${entry.title} - ${entry.url}`)
            .join('\n');

        const message = historyList || 'No history yet';
        alert('History:\n\n' + message);
    }

    private toggleDevTools(): void {
        this.devToolsPanel.style.display = this.devToolsPanel.style.display === 'none' ? 'flex' : 'none';
        if (this.devToolsPanel.style.display === 'flex') {
            this.updateDevTools();
        }
    }

    private hideDevTools(): void {
        this.devToolsPanel.style.display = 'none';
    }

    private switchDevToolsTab(tabName: string): void {
        document.querySelectorAll('.dev-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        document.querySelectorAll('.dev-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        const activePanel = document.getElementById(`dev-${tabName}`);
        if (activePanel) activePanel.classList.add('active');
    }

    private updateDevTools(): void {
        this.updateConsole();
        this.updateNetworkLog();
        this.updateElementsTree();
    }

    private updateConsole(): void {
        const consoleOutput = document.getElementById('console-output')!;
        consoleOutput.innerHTML = this.consoleMessages
            .map(msg => `<div>${msg}</div>`)
            .join('');
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    private updateNetworkLog(): void {
        const networkLog = document.getElementById('network-log')!;
        networkLog.innerHTML = this.networkRequests
            .map(req => `
                <div class="network-item">
                    ${req.method} ${req.url} - ${req.status} (${req.duration}ms)
                </div>
            `)
            .join('');
    }

    private updateElementsTree(): void {
        const elementsTree = document.getElementById('elements-tree')!;
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;

        try {
            const doc = tab.element.contentDocument;
            if (doc) {
                const tree = this.buildElementsTree(doc.body, 0);
                elementsTree.innerHTML = tree;
            }
        } catch (error) {
            elementsTree.innerHTML = '<div>Cannot access DOM due to same-origin policy</div>';
        }
    }

    private buildElementsTree(element: Element, depth: number): string {
        const indent = '  '.repeat(depth);
        const tagName = element.tagName.toLowerCase();
        const id = element.id ? `#${element.id}` : '';
        const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
        
        let html = `<div class="element-node">${indent}&lt;${tagName}${id}${classes}&gt;</div>`;
        
        for (let i = 0; i < Math.min(element.children.length, 10); i++) {
            html += this.buildElementsTree(element.children[i], depth + 1);
        }
        
        return html;
    }

    private executeConsoleCommand(command: string): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;

        const timestamp = new Date().toLocaleTimeString();
        this.consoleMessages.push(`[${timestamp}] > ${command}`);

        try {
            const result = (tab.element.contentWindow as any).eval(command);
            this.consoleMessages.push(`[${timestamp}] ${JSON.stringify(result)}`);
        } catch (error: any) {
            this.consoleMessages.push(`[${timestamp}] Error: ${error.message}`);
        }

        this.updateConsole();
    }

    private toggleDownloads(): void {
        this.downloadsPanel.style.display = this.downloadsPanel.style.display === 'none' ? 'flex' : 'none';
        if (this.downloadsPanel.style.display === 'flex') {
            this.updateDownloadsList();
        }
    }

    private hideDownloads(): void {
        this.downloadsPanel.style.display = 'none';
    }

    private toggleSettings(): void {
        this.settingsPanel.style.display = this.settingsPanel.style.display === 'none' ? 'flex' : 'none';
        if (this.settingsPanel.style.display === 'flex') {
            this.loadSettingsUI();
        }
    }

    private hideSettings(): void {
        this.settingsPanel.style.display = 'none';
    }

    private loadSettingsUI(): void {
        // Load current settings into UI
        document.getElementById('homepage-setting')!.setAttribute('value', this.settings.homepage);
        document.getElementById('search-engine-setting')!.setAttribute('value', this.settings.searchEngine);
        document.getElementById('restore-session-setting')!.setAttribute('checked', this.settings.restoreSession.toString());
        document.getElementById('download-path-setting')!.setAttribute('value', this.settings.downloadPath);
        document.getElementById('enable-javascript-setting')!.setAttribute('checked', this.settings.enableJavaScript.toString());
        document.getElementById('enable-cookies-setting')!.setAttribute('checked', this.settings.enableCookies.toString());
        document.getElementById('enable-popups-setting')!.setAttribute('checked', this.settings.enablePopups.toString());
        document.getElementById('theme-setting')!.setAttribute('value', this.settings.theme);
        document.getElementById('default-zoom-setting')!.setAttribute('value', this.settings.defaultZoom.toString());
        
        // Show/hide custom search URL based on selection
        const customSearchSetting = document.getElementById('custom-search-setting')!;
        if (this.settings.searchEngine === 'custom') {
            customSearchSetting.style.display = 'flex';
            document.getElementById('custom-search-url')!.setAttribute('value', this.settings.customSearchUrl || '');
        } else {
            customSearchSetting.style.display = 'none';
        }

        // Add event listeners for settings changes
        this.setupSettingsEventListeners();
    }

    private setupSettingsEventListeners(): void {
        // Search engine change handler
        document.getElementById('search-engine-setting')!.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            const customSearchSetting = document.getElementById('custom-search-setting')!;
            if (target.value === 'custom') {
                customSearchSetting.style.display = 'flex';
            } else {
                customSearchSetting.style.display = 'none';
            }
        });

        // Save settings button
        document.getElementById('settings-save')!.addEventListener('click', () => {
            this.saveSettingsFromUI();
        });

        // Reset settings button
        document.getElementById('settings-reset')!.addEventListener('click', () => {
            this.resetSettingsToDefaults();
        });
    }

    private saveSettingsFromUI(): void {
        this.settings.homepage = (document.getElementById('homepage-setting') as HTMLInputElement).value;
        this.settings.searchEngine = (document.getElementById('search-engine-setting') as HTMLSelectElement).value as any;
        this.settings.restoreSession = (document.getElementById('restore-session-setting') as HTMLInputElement).checked;
        this.settings.downloadPath = (document.getElementById('download-path-setting') as HTMLInputElement).value;
        this.settings.enableJavaScript = (document.getElementById('enable-javascript-setting') as HTMLInputElement).checked;
        this.settings.enableCookies = (document.getElementById('enable-cookies-setting') as HTMLInputElement).checked;
        this.settings.enablePopups = (document.getElementById('enable-popups-setting') as HTMLInputElement).checked;
        this.settings.theme = (document.getElementById('theme-setting') as HTMLSelectElement).value as any;
        this.settings.defaultZoom = parseFloat((document.getElementById('default-zoom-setting') as HTMLSelectElement).value);
        
        if (this.settings.searchEngine === 'custom') {
            this.settings.customSearchUrl = (document.getElementById('custom-search-url') as HTMLInputElement).value;
        }

        this.saveSettings();
        this.updateStatus('Settings saved successfully');
        this.hideSettings();
    }

    private resetSettingsToDefaults(): void {
        this.settings = {
            homepage: 'https://www.google.com',
            searchEngine: 'google',
            restoreSession: true,
            downloadPath: 'downloads',
            enableJavaScript: true,
            enableCookies: true,
            enablePopups: false,
            theme: 'light',
            defaultZoom: 1.0
        };
        
        this.saveSettings();
        this.loadSettingsUI();
        this.updateStatus('Settings reset to defaults');
    }

    private toggleBookmarksBar(): void {
        this.bookmarksBar.classList.toggle('collapsed');
        const isCollapsed = this.bookmarksBar.classList.contains('collapsed');
        this.updateStatus(`Bookmarks bar ${isCollapsed ? 'hidden' : 'shown'}`);
    }

    private addCurrentPageToBookmarks(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab || tab.url === 'about:blank' || tab.url === 'khoj://home') {
            this.updateStatus('Cannot bookmark this page');
            return;
        }

        // Check if bookmark already exists
        const existingBookmark = this.bookmarks.find(b => b.url === tab.url);
        if (existingBookmark) {
            this.updateStatus('Bookmark already exists');
            return;
        }

        // Create new bookmark
        const bookmark: Bookmark = {
            id: this.generateBookmarkId(),
            title: tab.title || new URL(tab.url).hostname,
            url: tab.url,
            favicon: tab.favicon || '',
            folder: 'Bookmarks Bar',
            dateAdded: Date.now()
        };

        this.bookmarks.push(bookmark);
        this.saveBookmarks();
        this.updateBookmarksBar();
        this.updateStatus('Bookmark added to bookmarks bar');
    }

    private updateBookmarksBar(): void {
        this.bookmarksList.innerHTML = '';
        
        // Get bookmarks for bookmarks bar
        const bookmarksBarBookmarks = this.bookmarks.filter(b => b.folder === 'Bookmarks Bar');
        
        bookmarksBarBookmarks.forEach(bookmark => {
            const bookmarkElement = this.createBookmarkElement(bookmark);
            this.bookmarksList.appendChild(bookmarkElement);
        });
    }

    private createBookmarkElement(bookmark: Bookmark): HTMLElement {
        const bookmarkItem = document.createElement('div');
        bookmarkItem.className = 'bookmark-item';
        bookmarkItem.dataset.bookmarkId = bookmark.id;
        
        // Create favicon
        const favicon = document.createElement('img');
        favicon.className = 'bookmark-favicon';
        favicon.src = bookmark.favicon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23667eea"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>';
        favicon.alt = '';
        
        // Create title
        const title = document.createElement('span');
        title.className = 'bookmark-title';
        title.textContent = bookmark.title;
        
        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'bookmark-remove';
        removeBtn.innerHTML = '<ion-icon name="close-outline"></ion-icon>';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeBookmark(bookmark.id);
        });
        
        bookmarkItem.appendChild(favicon);
        bookmarkItem.appendChild(title);
        bookmarkItem.appendChild(removeBtn);
        
        // Add click event to navigate
        bookmarkItem.addEventListener('click', () => {
            this.loadUrlInTab(this.activeTabId, bookmark.url);
        });
        
        return bookmarkItem;
    }

    private removeBookmark(bookmarkId: string): void {
        const index = this.bookmarks.findIndex(b => b.id === bookmarkId);
        if (index >= 0) {
            const bookmark = this.bookmarks[index];
            this.bookmarks.splice(index, 1);
            this.saveBookmarks();
            this.updateBookmarksBar();
            this.updateStatus(`Bookmark removed: ${bookmark.title}`);
        }
    }

    private generateBookmarkId(): string {
        return 'bookmark-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    private updateDownloadsList(): void {
        const downloadsList = document.getElementById('downloads-list')!;
        downloadsList.innerHTML = this.downloads
            .map(download => {
                const progressColor = download.status === 'completed' ? '#34a853' : '#1a73e8';
                const statusIcon = download.status === 'completed' ? 'â' : download.status === 'failed' ? 'â' : 'â';
                
                return `
                    <div class="download-item">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <strong>${download.filename}</strong>
                            <span style="color: ${progressColor};">${statusIcon} ${download.progress.toFixed(0)}%</span>
                        </div>
                        <div style="font-size: 11px; color: #5f6368; margin-bottom: 4px;">${download.url}</div>
                        <div style="background: #f1f3f4; height: 4px; border-radius: 2px; overflow: hidden;">
                            <div style="background: ${progressColor}; height: 100%; width: ${download.progress}%; transition: width 0.3s ease;"></div>
                        </div>
                        <div style="font-size: 11px; color: #5f6368; margin-top: 4px;">
                            Status: ${download.status} â¢ ${(download.size / 1024 / 1024).toFixed(1)} MB
                        </div>
                    </div>
                `;
            })
            .join('');
    }

    private simulateDownload(url: string): void {
        const filename = url.split('/').pop() || 'download';
        const download: Download = {
            id: Date.now().toString(),
            url,
            filename,
            size: Math.random() * 10000000,
            progress: 0,
            status: 'downloading',
            timestamp: Date.now()
        };

        this.downloads.push(download);
        this.updateDownloadsList();
        this.saveDownloads();

        const interval = setInterval(() => {
            download.progress += Math.random() * 20;
            if (download.progress >= 100) {
                download.progress = 100;
                download.status = 'completed';
                clearInterval(interval);
                this.updateStatus(`Download completed: ${filename}`);
            }
            this.updateDownloadsList();
            this.saveDownloads();
        }, 500);
    }

    private handleKeyboardShortcuts(e: KeyboardEvent): void {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 't':
                    e.preventDefault();
                    this.createTab();
                    break;
                case 'w':
                    e.preventDefault();
                    this.closeTab(this.activeTabId);
                    break;
                case 'Tab':
                    e.preventDefault();
                    const currentIndex = this.tabs.findIndex(t => t.id === this.activeTabId);
                    const nextIndex = e.shiftKey 
                        ? (currentIndex - 1 + this.tabs.length) % this.tabs.length
                        : (currentIndex + 1) % this.tabs.length;
                    this.switchToTab(this.tabs[nextIndex].id);
                    break;
                case 'f':
                    e.preventDefault();
                    this.showFindBar();
                    break;
                case 'p':
                    e.preventDefault();
                    this.printPage();
                    break;
                case 'l':
                    e.preventDefault();
                    this.urlBar.focus();
                    this.urlBar.select();
                    break;
                case '=':
                case '+':
                    e.preventDefault();
                    this.zoomIn();
                    break;
                case '-':
                    e.preventDefault();
                    this.zoomOut();
                    break;
                case '0':
                    e.preventDefault();
                    this.resetZoom();
                    break;
            }
        }
    }

    private updateUI(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;

        this.urlBar.value = tab.url;
        this.urlDisplay.textContent = tab.url;
        this.updateNavigationButtons();
        this.updateBookmarkButton();
        this.updateSecurityIndicator(tab.url);
    }

    private updateNavigationButtons(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;

        this.backButton.disabled = tab.historyIndex <= 0;
        this.forwardButton.disabled = tab.historyIndex >= tab.history.length - 1;
        this.reloadButton.disabled = !tab.url;
    }

    private updateBookmarkButton(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab || !tab.url) {
            this.bookmarkBtn.classList.remove('active');
            return;
        }

        const isBookmarked = this.bookmarks.some(b => b.url === tab.url);
        this.bookmarkBtn.classList.toggle('active', isBookmarked);
    }

    private updateMaximizeButton(): void {
        this.maximizeBtn.textContent = this.isMaximized ? '[]' : '[]';
    }

    private showLoading(show: boolean, tabId?: string): void {
        const targetTabId = tabId || this.activeTabId;
        const tab = this.tabs.find(t => t.id === targetTabId);
        if (!tab) return;

        tab.isLoading = show;
        
        if (targetTabId === this.activeTabId) {
            this.loadingIndicator.classList.toggle('active', show);
            this.statusText.textContent = show ? 'Loading...' : 'Ready';
            
            // Update progress bar
            if (show) {
                this.progressBar.classList.add('active');
                this.simulateProgress(tabId);
            } else {
                this.progressBar.classList.remove('active');
                tab.loadProgress = 0;
            }
        }
    }

    private simulateProgress(tabId?: string): void {
        const targetTabId = tabId || this.activeTabId;
        const tab = this.tabs.find(t => t.id === targetTabId);
        if (!tab) return;

        let progress = 0;
        const interval = setInterval(() => {
            if (!tab.isLoading || progress >= 100) {
                clearInterval(interval);
                if (progress >= 100) {
                    this.progressBar.style.transform = 'scaleX(0)';
                    tab.loadProgress = 0;
                }
                return;
            }

            progress += Math.random() * 15 + 5;
            progress = Math.min(progress, 95);
            tab.loadProgress = progress;
            
            if (tabId === this.activeTabId) {
                this.progressBar.style.transform = `scaleX(${progress / 100})`;
            }
        }, 200);
    }

    private hideError(): void {
        this.errorMessage.classList.remove('show');
    }

    private showError(message: string): void {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
    }

    private updateStatus(text: string): void {
        this.statusText.textContent = text;
        setTimeout(() => {
            if (this.statusText.textContent === text) {
                this.statusText.textContent = 'Ready';
            }
        }, 3000);
    }

    private addToHistory(tabId: string, url: string, title: string): void {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        const entry: BrowserHistory = {
            url,
            title,
            timestamp: Date.now()
        };

        if (tab.historyIndex < tab.history.length - 1) {
            tab.history = tab.history.slice(0, tab.historyIndex + 1);
        }

        tab.history.push(entry);
        tab.historyIndex = tab.history.length - 1;
        tab.title = title;

        // Update tab title in UI
        const tabElement = document.getElementById('tab-' + tabId);
        if (tabElement) {
            tabElement.querySelector('.tab-title')!.textContent = title;
        }

        this.updateNavigationButtons();
    }

    private saveBookmarks(): void {
        try {
            localStorage.setItem('browser_bookmarks', JSON.stringify(this.bookmarks));
        } catch (error) {
            console.warn('Could not save bookmarks to localStorage:', error);
        }
    }

    private loadBookmarks(): void {
        try {
            const saved = localStorage.getItem('browser_bookmarks');
            if (saved) {
                this.bookmarks = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Could not load bookmarks from localStorage:', error);
        }
    }

    private saveDownloads(): void {
        try {
            localStorage.setItem('browser_downloads', JSON.stringify(this.downloads));
        } catch (error) {
            console.warn('Could not save downloads to localStorage:', error);
        }
    }

    private loadDownloads(): void {
        try {
            const saved = localStorage.getItem('browser_downloads');
            if (saved) {
                this.downloads = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Could not load downloads from localStorage:', error);
        }
    }

    private importBookmarks(filePath: string): void {
        // Implementation for importing bookmarks from file
        this.updateStatus('Bookmarks imported from: ' + filePath);
    }

    private exportBookmarks(filePath: string): void {
        // Implementation for exporting bookmarks to file
        this.updateStatus('Bookmarks exported to: ' + filePath);
    }

    // Window control methods
    private async minimizeWindow(): Promise<void> {
        if (window.electronAPI) {
            await window.electronAPI.minimizeWindow();
        }
    }

    private async maximizeWindow(): Promise<void> {
        if (window.electronAPI) {
            await window.electronAPI.maximizeWindow();
        }
    }

    private async closeWindow(): Promise<void> {
        if (window.electronAPI) {
            await window.electronAPI.closeWindow();
        }
    }

    private closeTab(tabId: string): void {
        const tabIndex = this.tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;

        const tab = this.tabs[tabIndex];
        
        // Remove webview
        tab.element.remove();
        
        // Remove tab element
        document.getElementById('tab-' + tabId)!.remove();
        
        // Remove from tabs array
        this.tabs.splice(tabIndex, 1);

        // If closing active tab, switch to another
        if (tabId === this.activeTabId) {
            if (this.tabs.length > 0) {
                const newActiveIndex = Math.min(tabIndex, this.tabs.length - 1);
                this.switchToTab(this.tabs[newActiveIndex].id);
            }
        }

        // If no tabs left, create a new one
        if (this.tabs.length === 0) {
            this.createTab();
        }
        
        this.saveSession();
    }

    private showTabContextMenu(event: MouseEvent, tab: BrowserTab): void {
        // Create context menu
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.position = 'absolute';
        menu.style.left = event.pageX + 'px';
        menu.style.top = event.pageY + 'px';
        menu.style.background = '#fff';
        menu.style.border = '1px solid #dadce0';
        menu.style.borderRadius = '4px';
        menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        menu.style.zIndex = '10000';
        menu.style.padding = '4px 0';

        const items = [
            { text: 'New Tab', action: () => this.createTab() },
            { text: 'Duplicate Tab', action: () => this.duplicateTab(tab.id) },
            { text: 'Pin Tab', action: () => this.togglePinTab(tab.id) },
            { text: 'Close Tab', action: () => this.closeTab(tab.id) },
            { text: 'Close Other Tabs', action: () => this.closeOtherTabs(tab.id) }
        ];

        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.textContent = item.text;
            menuItem.style.padding = '8px 16px';
            menuItem.style.cursor = 'pointer';
            menuItem.style.fontSize = '13px';
            menuItem.addEventListener('mouseenter', () => menuItem.style.background = '#f8f9fa');
            menuItem.addEventListener('mouseleave', () => menuItem.style.background = '#fff');
            menuItem.addEventListener('click', () => {
                item.action();
                document.body.removeChild(menu);
            });
            menu.appendChild(menuItem);
        });

        document.body.appendChild(menu);

        // Remove menu when clicking elsewhere
        const removeMenu = (e: MouseEvent) => {
            if (!menu.contains(e.target as Node)) {
                document.body.removeChild(menu);
                document.removeEventListener('click', removeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', removeMenu), 100);
    }

    private duplicateTab(tabId: string): void {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;
        
        const newTab = this.createTab(tab.url);
        // Copy history and other properties
        const newTabObj = this.tabs[this.tabs.length - 1];
        newTabObj.history = [...tab.history];
        newTabObj.historyIndex = tab.historyIndex;
        newTabObj.title = tab.title;
    }

    private togglePinTab(tabId: string): void {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;
        
        tab.isPinned = !tab.isPinned;
        const tabElement = document.getElementById('tab-' + tabId)!;
        tabElement.classList.toggle('pinned', tab.isPinned);
        (tabElement.querySelector('.tab-close') as HTMLElement).style.display = tab.isPinned ? 'none' : 'block';
        
        this.saveSession();
    }

    private closeOtherTabs(tabId: string): void {
        const tabsToClose = this.tabs.filter(t => t.id !== tabId);
        tabsToClose.forEach(tab => this.closeTab(tab.id));
    }

    private reorderTabs(draggedTabId: string, targetTabId: string): void {
        const draggedIndex = this.tabs.findIndex(t => t.id === draggedTabId);
        const targetIndex = this.tabs.findIndex(t => t.id === targetTabId);
        
        if (draggedIndex === -1 || targetIndex === -1) return;
        
        const [draggedTab] = this.tabs.splice(draggedIndex, 1);
        this.tabs.splice(targetIndex, 0, draggedTab);
        
        // Re-render tabs
        this.tabsContainer.innerHTML = '';
        this.tabs.forEach(tab => this.createTabElement(tab));
        this.tabsContainer.appendChild(this.newTabBtn);
        
        this.saveSession();
    }

    private loadSettings(): void {
        try {
            const saved = localStorage.getItem('khoj_settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Could not load settings from localStorage:', error);
        }
    }

    private saveSettings(): void {
        try {
            localStorage.setItem('khoj_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Could not save settings to localStorage:', error);
        }
    }

    private saveSession(): void {
        if (!this.settings.restoreSession) return;
        
        const session: BrowserSession = {
            tabs: this.tabs.map(tab => ({
                id: tab.id,
                url: tab.url,
                title: tab.title,
                isPinned: tab.isPinned
            })),
            activeTabId: this.activeTabId,
            windowState: {
                width: window.innerWidth,
                height: window.innerHeight,
                isMaximized: this.isMaximized
            }
        };
        
        try {
            localStorage.setItem('khoj_session', JSON.stringify(session));
        } catch (error) {
            console.warn('Could not save session to localStorage:', error);
        }
    }

    private restoreSession(): void {
        if (!this.settings.restoreSession) return;
        
        try {
            const saved = localStorage.getItem('khoj_session');
            if (saved) {
                const session = JSON.parse(saved) as BrowserSession;
                
                // Restore tabs
                session.tabs.forEach(tabData => {
                    this.createTab(tabData.url);
                    const tab = this.tabs[this.tabs.length - 1];
                    tab.title = tabData.title;
                    tab.isPinned = tabData.isPinned;
                });
                
                // Set active tab
                if (session.activeTabId && this.tabs.find(t => t.id === session.activeTabId)) {
                    this.switchToTab(session.activeTabId);
                }
            }
        } catch (error) {
            console.warn('Could not restore session from localStorage:', error);
        }
    }
}

// Initialize the browser when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new KhojBrowser();
});
