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

class Browser {
    private webview!: HTMLIFrameElement;
    private urlBar!: HTMLInputElement;
    private backButton!: HTMLButtonElement;
    private forwardButton!: HTMLButtonElement;
    private reloadButton!: HTMLButtonElement;
    private homeButton!: HTMLButtonElement;
    private goButton!: HTMLButtonElement;
    private bookmarkButton!: HTMLButtonElement;
    private historyButton!: HTMLButtonElement;
    private statusText!: HTMLElement;
    private loadingIndicator!: HTMLElement;
    private urlDisplay!: HTMLElement;
    private errorMessage!: HTMLElement;

    private history: BrowserHistory[] = [];
    private bookmarks: Bookmark[] = [];
    private historyIndex: number = -1;
    private currentUrl: string = '';

    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadInitialState();
    }

    private initializeElements(): void {
        this.webview = document.getElementById('webview') as HTMLIFrameElement;
        this.urlBar = document.getElementById('url-bar') as HTMLInputElement;
        this.backButton = document.getElementById('back-btn') as HTMLButtonElement;
        this.forwardButton = document.getElementById('forward-btn') as HTMLButtonElement;
        this.reloadButton = document.getElementById('reload-btn') as HTMLButtonElement;
        this.homeButton = document.getElementById('home-btn') as HTMLButtonElement;
        this.goButton = document.getElementById('go-btn') as HTMLButtonElement;
        this.bookmarkButton = document.getElementById('bookmark-btn') as HTMLButtonElement;
        this.historyButton = document.getElementById('history-btn') as HTMLButtonElement;
        this.statusText = document.getElementById('status-text') as HTMLElement;
        this.loadingIndicator = document.getElementById('loading-indicator') as HTMLElement;
        this.urlDisplay = document.getElementById('url-display') as HTMLElement;
        this.errorMessage = document.getElementById('error-message') as HTMLElement;
    }

    private setupEventListeners(): void {
        this.backButton.addEventListener('click', () => this.goBack());
        this.forwardButton.addEventListener('click', () => this.goForward());
        this.reloadButton.addEventListener('click', () => this.reload());
        this.homeButton.addEventListener('click', () => this.goHome());
        this.goButton.addEventListener('click', () => this.navigate());
        this.bookmarkButton.addEventListener('click', () => this.toggleBookmark());
        this.historyButton.addEventListener('click', () => this.showHistory());

        this.urlBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.navigate();
            }
        });

        this.webview.addEventListener('load', () => this.onPageLoad());
        this.webview.addEventListener('error', () => this.onPageError());
    }

    private loadInitialState(): void {
        this.loadBookmarks();
        this.loadHistory();
        this.goHome();
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
        this.loadUrl(formattedUrl);
    }

    private loadUrl(url: string): void {
        this.showLoading(true);
        this.hideError();
        
        try {
            this.webview.src = url;
            this.currentUrl = url;
            this.urlBar.value = url;
            this.urlDisplay.textContent = url;
            this.updateNavigationButtons();
        } catch (error) {
            this.showError('Failed to load URL: ' + error);
            this.showLoading(false);
        }
    }

    private goBack(): void {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const previousPage = this.history[this.historyIndex];
            this.loadUrl(previousPage.url);
        }
    }

    private goForward(): void {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const nextPage = this.history[this.historyIndex];
            this.loadUrl(nextPage.url);
        }
    }

    private reload(): void {
        if (this.currentUrl) {
            this.webview.src = this.currentUrl;
            this.showLoading(true);
        }
    }

    private goHome(): void {
        this.loadUrl('https://www.google.com');
    }

    private onPageLoad(): void {
        this.showLoading(false);
        this.updateStatus('Page loaded');
        
        try {
            const title = this.webview.contentDocument?.title || 'Untitled';
            this.addToHistory(this.currentUrl, title);
        } catch (error) {
            console.warn('Could not access iframe content due to same-origin policy');
            this.addToHistory(this.currentUrl, new URL(this.currentUrl).hostname);
        }
        
        this.updateBookmarkButton();
    }

    private onPageError(): void {
        this.showLoading(false);
        this.showError('Failed to load the page. Please check the URL and try again.');
        this.updateStatus('Error loading page');
    }

    private addToHistory(url: string, title: string): void {
        const entry: BrowserHistory = {
            url,
            title,
            timestamp: Date.now()
        };

        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        this.history.push(entry);
        this.historyIndex = this.history.length - 1;
        this.saveHistory();
        this.updateNavigationButtons();
    }

    private toggleBookmark(): void {
        if (!this.currentUrl) return;

        const existingIndex = this.bookmarks.findIndex(b => b.url === this.currentUrl);
        
        if (existingIndex >= 0) {
            this.bookmarks.splice(existingIndex, 1);
            this.updateStatus('Bookmark removed');
        } else {
            const bookmark: Bookmark = {
                id: 'bookmark-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                url: this.currentUrl,
                title: this.webview.contentDocument?.title || new URL(this.currentUrl).hostname,
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
        const historyList = this.history
            .slice()
            .reverse()
            .map((entry, index) => `${index + 1}. ${entry.title} - ${entry.url}`)
            .join('\n');

        const message = historyList || 'No history yet';
        alert('History:\n\n' + message);
    }

    private updateNavigationButtons(): void {
        this.backButton.disabled = this.historyIndex <= 0;
        this.forwardButton.disabled = this.historyIndex >= this.history.length - 1;
        this.reloadButton.disabled = !this.currentUrl;
    }

    private updateBookmarkButton(): void {
        if (!this.currentUrl) {
            this.bookmarkButton.textContent = 'Bookmark';
            return;
        }

        const isBookmarked = this.bookmarks.some(b => b.url === this.currentUrl);
        this.bookmarkButton.textContent = isBookmarked ? 'Unbookmark' : 'Bookmark';
    }

    private showLoading(show: boolean): void {
        this.loadingIndicator.classList.toggle('active', show);
        this.statusText.textContent = show ? 'Loading...' : 'Ready';
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

    private saveHistory(): void {
        try {
            localStorage.setItem('browser_history', JSON.stringify(this.history));
        } catch (error) {
            console.warn('Could not save history to localStorage:', error);
        }
    }

    private loadHistory(): void {
        try {
            const saved = localStorage.getItem('browser_history');
            if (saved) {
                this.history = JSON.parse(saved);
                this.historyIndex = this.history.length - 1;
            }
        } catch (error) {
            console.warn('Could not load history from localStorage:', error);
        }
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
}

document.addEventListener('DOMContentLoaded', () => {
    new Browser();
});
