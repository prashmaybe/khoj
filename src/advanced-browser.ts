interface BrowserTab {
    id: string;
    url: string;
    title: string;
    history: BrowserHistory[];
    historyIndex: number;
    isLoading: boolean;
    zoomLevel: number;
    isPrivate: boolean;
    element: HTMLIFrameElement;
}

interface BrowserHistory {
    url: string;
    title: string;
    timestamp: number;
}

interface Bookmark {
    url: string;
    title: string;
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

interface NetworkRequest {
    url: string;
    method: string;
    status: number;
    timestamp: number;
    duration: number;
}

class AdvancedBrowser {
    private tabs: BrowserTab[] = [];
    private activeTabId: string = '';
    private bookmarks: Bookmark[] = [];
    private downloads: Download[] = [];
    private isPrivateMode: boolean = false;
    private networkRequests: NetworkRequest[] = [];
    private consoleMessages: string[] = [];

    // UI Elements
    private tabsBar!: HTMLElement;
    private webviewsContainer!: HTMLElement;
    private urlBar!: HTMLInputElement;
    private backButton!: HTMLButtonElement;
    private forwardButton!: HTMLButtonElement;
    private reloadButton!: HTMLButtonElement;
    private homeButton!: HTMLButtonElement;
    private goButton!: HTMLButtonElement;
    private findButton!: HTMLButtonElement;
    private printButton!: HTMLButtonElement;
    private zoomInButton!: HTMLButtonElement;
    private zoomOutButton!: HTMLButtonElement;
    private zoomLevel!: HTMLElement;
    private bookmarkButton!: HTMLButtonElement;
    private historyButton!: HTMLButtonElement;
    private devToolsButton!: HTMLButtonElement;
    private privateButton!: HTMLButtonElement;
    private downloadsButton!: HTMLButtonElement;
    private statusText!: HTMLElement;
    private loadingIndicator!: HTMLElement;
    private urlDisplay!: HTMLElement;
    private errorMessage!: HTMLElement;
    private findBar!: HTMLElement;
    private findInput!: HTMLInputElement;
    private downloadsPanel!: HTMLElement;
    private devToolsPanel!: HTMLElement;

    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadInitialState();
        this.createTab('https://www.google.com');
    }

    private initializeElements(): void {
        this.tabsBar = document.getElementById('tabs-bar')!;
        this.webviewsContainer = document.getElementById('webviews')!;
        this.urlBar = document.getElementById('url-bar') as HTMLInputElement;
        this.backButton = document.getElementById('back-btn') as HTMLButtonElement;
        this.forwardButton = document.getElementById('forward-btn') as HTMLButtonElement;
        this.reloadButton = document.getElementById('reload-btn') as HTMLButtonElement;
        this.homeButton = document.getElementById('home-btn') as HTMLButtonElement;
        this.goButton = document.getElementById('go-btn') as HTMLButtonElement;
        this.findButton = document.getElementById('find-btn') as HTMLButtonElement;
        this.printButton = document.getElementById('print-btn') as HTMLButtonElement;
        this.zoomInButton = document.getElementById('zoom-in-btn') as HTMLButtonElement;
        this.zoomOutButton = document.getElementById('zoom-out-btn') as HTMLButtonElement;
        this.zoomLevel = document.getElementById('zoom-level')!;
        this.bookmarkButton = document.getElementById('bookmark-btn') as HTMLButtonElement;
        this.historyButton = document.getElementById('history-btn') as HTMLButtonElement;
        this.devToolsButton = document.getElementById('dev-tools-btn') as HTMLButtonElement;
        this.privateButton = document.getElementById('private-btn') as HTMLButtonElement;
        this.downloadsButton = document.getElementById('downloads-btn') as HTMLButtonElement;
        this.statusText = document.getElementById('status-text')!;
        this.loadingIndicator = document.getElementById('loading-indicator')!;
        this.urlDisplay = document.getElementById('url-display')!;
        this.errorMessage = document.getElementById('error-message')!;
        this.findBar = document.getElementById('find-bar')!;
        this.findInput = document.getElementById('find-input') as HTMLInputElement;
        this.downloadsPanel = document.getElementById('downloads-panel')!;
        this.devToolsPanel = document.getElementById('dev-tools-panel')!;
    }

    private setupEventListeners(): void {
        // Navigation
        this.backButton.addEventListener('click', () => this.goBack());
        this.forwardButton.addEventListener('click', () => this.goForward());
        this.reloadButton.addEventListener('click', () => this.reload());
        this.homeButton.addEventListener('click', () => this.goHome());
        this.goButton.addEventListener('click', () => this.navigate());

        // URL bar
        this.urlBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.navigate();
        });

        // Find functionality
        this.findButton.addEventListener('click', () => this.showFindBar());
        document.getElementById('find-close')!.addEventListener('click', () => this.hideFindBar());
        document.getElementById('find-next')!.addEventListener('click', () => this.findNext());
        document.getElementById('find-prev')!.addEventListener('click', () => this.findPrev());
        this.findInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.findNext();
        });

        // Zoom controls
        this.zoomInButton.addEventListener('click', () => this.zoomIn());
        this.zoomOutButton.addEventListener('click', () => this.zoomOut());

        // Print
        this.printButton.addEventListener('click', () => this.printPage());

        // Other features
        this.bookmarkButton.addEventListener('click', () => this.toggleBookmark());
        this.historyButton.addEventListener('click', () => this.showHistory());
        this.devToolsButton.addEventListener('click', () => this.toggleDevTools());
        this.privateButton.addEventListener('click', () => this.togglePrivateMode());
        this.downloadsButton.addEventListener('click', () => this.toggleDownloads());

        // Panel controls
        document.getElementById('downloads-close')!.addEventListener('click', () => this.hideDownloads());
        document.getElementById('dev-tools-close')!.addEventListener('click', () => this.hideDevTools());

        // Dev tools tabs
        document.querySelectorAll('.dev-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                this.switchDevToolsTab(target.dataset.tab!);
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

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // New tab button
        document.getElementById('new-tab-btn')!.addEventListener('click', () => this.createTab());
    }

    private loadInitialState(): void {
        this.loadBookmarks();
        this.loadDownloads();
        this.updatePrivateButton();
    }

    private generateTabId(): string {
        return 'tab-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    private createTab(url: string = 'about:blank'): void {
        const tabId = this.generateTabId();
        const webview = document.createElement('iframe');
        webview.className = 'webview';
        webview.id = tabId;
        webview.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';
        
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
        this.webviewsContainer.appendChild(webview);
        this.createTabElement(tab);
        this.switchToTab(tabId);
        
        if (url !== 'about:blank') {
            this.loadUrlInTab(tabId, url);
        }
    }

    private createTabElement(tab: BrowserTab): void {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        tabElement.id = 'tab-' + tab.id;
        tabElement.innerHTML = `
            <span class="tab-title">${tab.title}</span>
            <button class="tab-close">×</button>
        `;

        tabElement.addEventListener('click', (e) => {
            if (!(e.target as HTMLElement).classList.contains('tab-close')) {
                this.switchToTab(tab.id);
            }
        });

        tabElement.querySelector('.tab-close')!.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(tab.id);
        });

        this.tabsBar.appendChild(tabElement);
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
    }

    private loadUrlInTab(tabId: string, url: string): void {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        this.showLoading(true, tabId);
        this.hideError();
        
        try {
            tab.element.src = url;
            tab.url = url;
            tab.isLoading = true;
            
            if (tabId === this.activeTabId) {
                this.urlBar.value = url;
                this.urlDisplay.textContent = url;
            }
            
            this.updateNavigationButtons();
        } catch (error) {
            this.showError('Failed to load URL: ' + error);
            this.showLoading(false, tabId);
        }
    }

    private formatUrl(url: string): string {
        if (!url) return '';
        
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        
        if (url.includes('.') && !url.includes(' ')) {
            return `https://${url}`;
        }
        
        return `https://www.google.com/search?q=${encodeURIComponent(url)}`;
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
        this.loadUrlInTab(this.activeTabId, 'https://www.google.com');
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

    private applyZoom(tab: BrowserTab): void {
        tab.element.style.transform = `scale(${tab.zoomLevel})`;
        tab.element.style.transformOrigin = 'top left';
        
        if (tab.id === this.activeTabId) {
            this.zoomLevel.textContent = Math.round(tab.zoomLevel * 100) + '%';
        }
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
                id: 'bookmark-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                url: tab.url,
                title: tab.title,
                favicon: '',
                folder: 'Bookmarks Bar',
                dateAdded: Date.now(),
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
        document.querySelector(`[data-tab="${tabName}"]`)!.classList.add('active');

        document.querySelectorAll('.dev-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`dev-${tabName}`)!.classList.add('active');
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

    private togglePrivateMode(): void {
        this.isPrivateMode = !this.isPrivateMode;
        this.updatePrivateButton();
        this.updateStatus(this.isPrivateMode ? 'Private mode enabled' : 'Private mode disabled');
    }

    private updatePrivateButton(): void {
        this.privateButton.textContent = this.isPrivateMode ? 'Private ON' : 'Private';
        this.privateButton.style.background = this.isPrivateMode ? '#28a745' : '';
        this.privateButton.style.color = this.isPrivateMode ? 'white' : '';
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

    private updateDownloadsList(): void {
        const downloadsList = document.getElementById('downloads-list')!;
        downloadsList.innerHTML = this.downloads
            .map(download => `
                <div class="download-item">
                    <div><strong>${download.filename}</strong></div>
                    <div>${download.url}</div>
                    <div>Status: ${download.status} (${download.progress}%)</div>
                </div>
            `)
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

        const interval = setInterval(() => {
            download.progress += Math.random() * 20;
            if (download.progress >= 100) {
                download.progress = 100;
                download.status = 'completed';
                clearInterval(interval);
                this.updateStatus(`Download completed: ${filename}`);
            }
            this.updateDownloadsList();
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
                    const tab = this.tabs.find(t => t.id === this.activeTabId);
                    if (tab) {
                        tab.zoomLevel = 1.0;
                        this.applyZoom(tab);
                    }
                    break;
            }
        }
    }

    private updateUI(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;

        this.urlBar.value = tab.url;
        this.urlDisplay.textContent = tab.url;
        this.zoomLevel.textContent = Math.round(tab.zoomLevel * 100) + '%';
        this.updateNavigationButtons();
        this.updateBookmarkButton();
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
            this.bookmarkButton.textContent = 'Bookmark';
            return;
        }

        const isBookmarked = this.bookmarks.some(b => b.url === tab.url);
        this.bookmarkButton.textContent = isBookmarked ? 'Unbookmark' : 'Bookmark';
    }

    private showLoading(show: boolean, tabId?: string): void {
        const targetTabId = tabId || this.activeTabId;
        const tab = this.tabs.find(t => t.id === targetTabId);
        if (!tab) return;

        tab.isLoading = show;
        
        if (targetTabId === this.activeTabId) {
            this.loadingIndicator.classList.toggle('active', show);
            this.statusText.textContent = show ? 'Loading...' : 'Ready';
        }
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
}

document.addEventListener('DOMContentLoaded', () => {
    new AdvancedBrowser();
});
