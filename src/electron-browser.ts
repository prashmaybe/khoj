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

interface ConsoleMessage {
    level: 'log' | 'info' | 'warn' | 'error' | 'debug';
    message: string;
    timestamp: number;
    source?: string;
    lineNumber?: number;
}

interface NetworkRequest {
    url: string;
    method: string;
    status: number;
    timestamp: number;
    duration: number;
    type: string;
    size: number;
    headers?: Record<string, string>;
    response?: string;
}

interface CustomPerformanceEntry {
    perfName: string;
    perfType: string;
    perfStartTime: number;
    perfDuration: number;
    details?: unknown;
    toJSON(): string;
}

interface StorageItem {
    key: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: string;
    httpOnly?: boolean;
    secure?: boolean;
}

interface SourceFile {
    url: string;
    content: string;
    type: string;
    size: number;
    lastModified: number;
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
        runAt?: string;
    } | {}
}

interface LocalizationStrings {
    [key: string]: {
        [language: string]: string;
    };
}

interface Language {
    code: string;
    name: string;
    nativeName: string;
    rtl: boolean;
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
    [x: string]: any;
    private tabs: BrowserTab[] = [];
    private activeTabId: string = '';
    private bookmarks: Bookmark[] = [];
    private downloads: Download[] = [];
    private isPrivateMode: boolean = false;
    private networkRequests: NetworkRequest[] = [];
    private consoleMessages: ConsoleMessage[] = [];
    
    // Localization
    private currentLanguage: string = 'en';
    private languages: Language[] = [
        { code: 'en', name: 'English', nativeName: 'English', rtl: false },
        { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false },
        { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', rtl: false },
        { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', rtl: false },
        { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', rtl: false },
        { code: 'mr', name: 'Marathi', nativeName: 'मराठी', rtl: false },
        { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', rtl: false },
        { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', rtl: false },
        { code: 'ml', name: 'Malayalam', nativeName: 'മലയലം', rtl: false },
        { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', rtl: false },
        { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', rtl: false },
        { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', rtl: false },
        { code: 'ur', name: 'Urdu', nativeName: 'اردو', rtl: true }
    ];
    
    private strings: LocalizationStrings = {
        // English
        welcome: {
            en: 'Welcome to Khoj',
            hi: 'खोज में आपका स्वागत है',
            bn: 'খোজে স্বাগতম',
            ta: 'கோஜில் உங்களை வரவுகிறோம்',
            te: 'ఖోజ్‌లో స్వాగతం దీరి',
            mr: 'खोज मध्ये आपले आहेरात आहे',
            gu: 'ખોજમાં આપનું સ્વાગત છે',
            kn: 'ಖೋಜಿಗೆ ಸ್ವಾಗತಿದ್ದೀಸಿ',
            ml: 'ഖോജിലേക്കുകളിൽ സ്വാഗതം',
            pa: 'ਖੋਜ ਵਿੱਚ ਆਇਆਂ ਹੈ',
            or: 'ଖୋଜରେ ସ୍ଵାଗତ ଅଛି',
            as: 'খোজল স্বাগতম',
            ur: 'کھوج میں آپ کا خیر مقدم ہے'
        },
        newTab: {
            en: 'New Tab',
            hi: 'नया टैब',
            bn: 'নতুন ট্যাব',
            ta: 'புதிய தாவலை',
            te: 'కొత్త ట్యాబ్',
            mr: 'नवा टॅब',
            gu: 'નવું ટૅબ',
            kn: 'ಹೊಸಟ್ಯಾಬ್',
            ml: 'പുതിയ ടാബ്',
            pa: 'ਨਵਾਂ ਟੈਬ',
            or: 'ନୂତନିଆ ଟାବ',
            as: 'নতুন টেব',
            ur: 'نیا ٹیب'
        },
        closeTab: {
            en: 'Close Tab',
            hi: 'टैब बंद करें',
            bn: 'ট্যাব বন্ধ করুন',
            ta: 'தாவலை மூடு',
            te: 'ట్యాబ్ మూసి',
            mr: 'टॅब बंद करा',
            gu: 'ટૅબ બંધ કરો',
            kn: 'ಟ್ಯಾಬ್ ಮುಚ್ಚಿ',
            ml: 'ടാബ് അടയ്ക്കുക',
            pa: 'ਟੈਬ ਬੰਦ ਕਰੋ',
            or: 'ଟାବ ବନ୍ଦ କରୁନ୍ତୁ',
            as: 'টেব বন্ধ করুন',
            ur: 'ٹیب بند کریں'
        },
        bookmarks: {
            en: 'Bookmarks',
            hi: 'बुकमार्क्स',
            bn: 'বুকমার্ক',
            ta: 'புத்தக்கள்',
            te: 'ఇష్టమార్క్స్',
            mr: 'बुकमार्क्स',
            gu: 'બુકમાર્ક',
            kn: 'ಬುಕ್ಮಾರ್ಕ್ಸ್',
            ml: 'ബുക്ക്മാർക്കൾ',
            pa: 'ਬੁੱਕਮਾਰਕ',
            or: 'ବୁକମାର୍କ',
            as: 'বুকমার্ক',
            ur: 'بک مارکس'
        },
        downloads: {
            en: 'Downloads',
            hi: 'डाउनलोड्स',
            bn: 'ডাউনলোড',
            ta: 'பதிவிப்புகள்',
            te: 'డౌన్‌లోడ్లు',
            mr: 'डाउनलोड्स',
            gu: 'ડાઉનલોડ',
            kn: 'ಡೌನ್‌ಲೋಡ್ಸ್',
            ml: 'ഡൌൺന്‌ലോഡുകൾ',
            pa: 'ਡਾਊਨਲੋਡ',
            or: 'ଡାଉନଲୋଡ',
            as: 'ডাউনলোড',
            ur: 'ڈاؤن لوڈ'
        },
        devTools: {
            en: 'Developer Tools',
            hi: 'डेवलपर टूल्स',
            bn: 'ডেভেলপার টুলস',
            ta: 'நிரலம்பியாள் கருவிகள்',
            te: 'డెవలపర్ టూల్స్',
            mr: 'डेव्हलपर टूल्स',
            gu: 'ડેવલપર ટૂલ્સ',
            kn: 'ಡೆವಲಪರ್ ಟೂಲ್ಸ್',
            ml: 'ഡെവലപ്പർ ടൂളുകൾ',
            pa: 'ਡੇਵਲਪਰ ਟੂਲਜ਼',
            or: 'ଡେଭଲପର ଟୁଲସ',
            as: 'ডেভেলপার টুলস',
            ur: 'ڈویلپر ٹولز'
        },
        settings: {
            en: 'Settings',
            hi: 'सेटिंग्स',
            bn: 'সেটিংস',
            ta: 'அமைப்புகள்',
            te: 'సెట్టింగ్స్',
            mr: 'सेटिंग्स',
            gu: 'સેટિંગ્સ',
            kn: 'ಸೆಟ್ಟಿಂಗ್ಸ್',
            ml: 'ക്രമീകളുകൾ',
            pa: 'ਸੈਟਿੰਗਜ',
            or: 'ସେଟିଂଗ',
            as: 'সেটিংস',
            ur: 'ترتیبات'
        },
        goodMorning: {
            en: 'Good Morning! ☀️',
            hi: 'सुप्रभात 🌅',
            bn: 'শুভ স্বাগতম ☀️',
            ta: 'காலைய்களை வணக்கள் ☀️',
            te: 'శుభోదం స్వాగతం ☀️',
            mr: 'शुभ सकाळ ☀️',
            gu: 'સુવાળ સ્વાગત ☀️',
            kn: 'ಶುಭೋದ ಸ್ವಾಗತ ☀️',
            ml: 'ശുഭകാളം സ്വാഗതം ☀️',
            pa: 'ਸਵੇਰ ਸੁਆਖ ☀️',
            or: 'ସକାଳ ଶୁଭ ସ୍ଵାଗତ ☀️',
            as: 'সুবেৰ স্বাগতম ☀️',
            ur: 'صبح بخیر! ☀️'
        },
        goodAfternoon: {
            en: 'Good Afternoon! 🌤️',
            hi: 'दोपहर 🌤️',
            bn: 'দুপুর স্বাগতম 🌤️',
            ta: 'மத்யால் வணக்கள் 🌤️',
            te: 'మధ్యపహం 🌤️',
            mr: 'दुपार 🌤️',
            gu: 'બપોર 🌤️',
            kn: 'ಮಧ್ಯಾಹು 🌤️',
            ml: 'ഉച്ച കാലിയുകൾ 🌤️',
            pa: 'ਦੁਪੁਰ 🌤️',
            or: 'ବିହଣ ସ୍ଵାଗତ 🌤️',
            as: 'দুপুর স্বাগতম 🌤️',
            ur: 'دوپہ بخیر! 🌤️'
        },
        goodEvening: {
            en: 'Good Evening! 🌅',
            hi: 'शाम 🌅',
            bn: 'সন্ধ্যা স্বাগতম 🌅',
            ta: 'சாலி வணக்கள் 🌅',
            te: 'సాయం 🌅',
            mr: 'सांज 🌅',
            gu: 'સાંજ 🌅',
            kn: 'ಸಂಜೆ 🌅',
            ml: 'വൈകാലിയുകൾ 🌅',
            pa: 'ਸ਼ਾਮ 🌅',
            or: 'ସନ୍ଧ୍ଯା ସ୍ଵାଗତ 🌅',
            as: 'সন্ধ্যা স্বাগতম 🌅',
            ur: 'شام بخیر! 🌅'
        },
        goodNight: {
            en: 'Good Night! 🌙',
            hi: 'शुभ रात्री 🌙',
            bn: 'শুভ রাত্রি 🌙',
            ta: 'இரவு வணக்கள் 🌙',
            te: 'శుభోదం రాత్రి 🌙',
            mr: 'शुभ रात्री 🌙',
            gu: 'શુભ રાત્રી 🌙',
            kn: 'ಶುಭೋದ ರಾತ್ರಿ 🌙',
            ml: 'ശുഭോദം രാത്രി 🌙',
            pa: 'ਸ਼ਾਮ ਰਾਤ 🌙',
            or: 'ଶୁଭ ରାତ୍ରୀ 🌙',
            as: 'শুভ রাত্রি 🌙',
            ur: 'شام بخیر! 🌙'
        }
    };
    private isMaximized: boolean = false;
    private settings!: BrowserSettings;
    private session!: BrowserSession;
    private draggedTab: string | null = null;
    private extensions: BrowserExtension[] = [];
    private performanceMetrics: PerformanceMetrics[] = [];
    private performanceMonitoringInterval: NodeJS.Timeout | null = null;
    private pageErrors: PageError[] = [];
    private tabLoadTimeouts: { [key: string]: NodeJS.Timeout } = {};
    private performanceEntries: CustomPerformanceEntry[] = [];
    private activeConsoleFilter: string = 'all';
    private activeNetworkFilter: string = 'all';
    private isRecordingPerformance: boolean = false;
    private selectedElement: Element | null = null;

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
        this.loadSettings();
        this.loadSession();
        this.loadBookmarks();
        this.loadDownloads();
        this.loadExtensions();
        this.initializeElements();
        this.initializeUI();
        this.setupEventListeners();
        this.setupElectronEventListeners();
        this.startPerformanceMonitoring();
        
        // Initialize language
        this.currentLanguage = this.detectLanguage();
        this.createLanguageSwitcher();
        
        this.createTab(); // Start with one tab
        this.loadWelcomePage(this.activeTabId);
    }

    private handleStorageError(operation: 'load' | 'save', key: string, error: unknown): void {
        const action = operation === 'load' ? 'load' : 'save';
        console.warn(`Could not ${action} ${key} from localStorage:`, error);
    }

    private loadSession(): void {
        try {
            const saved = localStorage.getItem('browser_session');
            if (saved) {
                this.session = JSON.parse(saved);
            }
        } catch (error) {
            this.handleStorageError('load', 'session', error);
        }
    }

    private initializeUI(): void {
        // Initialize UI elements
        // This method is called to set up the initial UI state
        console.log('UI initialized');
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
        this.bookmarksManage.addEventListener('click', () => this.showBookmarks());
        this.bookmarksAdd.addEventListener('click', () => this.addCurrentPageToBookmarks());

        // Dev tools tabs
        document.querySelectorAll('.dev-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const tabName = target.dataset.tab;
                if (tabName) this.switchDevToolsTab(tabName);
            });
        });

        // Console filters
        document.querySelectorAll('.console-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const level = target.dataset.level;
                if (level) {
                    this.activeConsoleFilter = level;
                    this.updateConsoleFilterUI();
                    this.updateConsole();
                }
            });
        });

        // Network filters
        document.querySelectorAll('.network-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const type = target.dataset.type;
                if (type) {
                    this.activeNetworkFilter = type;
                    this.updateNetworkFilterUI();
                    this.updateNetworkLog();
                }
            });
        });

        // Console actions
        document.getElementById('console-clear')?.addEventListener('click', () => {
            this.consoleMessages = [];
            this.updateConsole();
        });

        // Network actions
        document.getElementById('network-clear')?.addEventListener('click', () => {
            this.networkRequests = [];
            this.updateNetworkLog();
        });

        // Performance actions
        document.getElementById('perf-record')?.addEventListener('click', () => {
            this.togglePerformanceRecording();
        });

        document.getElementById('perf-clear')?.addEventListener('click', () => {
            this.performanceEntries = [];
            this.updatePerformancePanel();
        });

        // Elements tools
        document.getElementById('element-inspect')?.addEventListener('click', () => {
            this.startElementInspection();
        });

        document.getElementById('element-search')?.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            this.searchElements(target.value);
        });

        // Application tree
        document.querySelectorAll('.tree-node[data-section]').forEach(node => {
            node.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const section = target.dataset.section;
                if (section) {
                    this.showApplicationSection(section);
                }
            });
        });

        // Dev tools controls
        document.getElementById('dev-tools-dock')?.addEventListener('click', () => {
            this.toggleDevToolsDock();
        });

        document.getElementById('dev-tools-settings')?.addEventListener('click', () => {
            this.showDevToolsSettings();
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

    private loadExtensions(): void {
        try {
            const saved = localStorage.getItem('browser_extensions');
            if (saved) {
                this.extensions = JSON.parse(saved);
            }
        } catch (error) {
            this.handleStorageError('load', 'extensions', error);
        }
    }

    private saveExtensions(): void {
        try {
            localStorage.setItem('browser_extensions', JSON.stringify(this.extensions));
        } catch (error) {
            this.handleStorageError('save', 'extensions', error);
        }
    }

    private executeExtensionScripts(tabId: string): void {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        this.extensions
            .filter(ext => ext.enabled && 'content' in ext.scripts && ext.scripts.content)
            .forEach(extension => {
                try {
                    const doc = tab.element.contentDocument;
                    if (doc && doc.head) {
                        const script = doc.createElement('script');
                        script.textContent = (extension.scripts as { content: string }).content;
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

    private createTab(url: string = ''): void {
        const tabId = this.generateTabId();
        const webview = document.createElement('iframe');
        webview.className = 'webview';
        webview.id = tabId;
        
        // Apply security sandbox with appropriate restrictions
        // Allow scripts, forms, and same-origin for functionality
        // Block potentially dangerous features
        webview.setAttribute('sandbox', 
            'allow-scripts ' +
            'allow-same-origin ' +
            'allow-forms ' +
            'allow-popups ' +
            'allow-modals'
        );
        
        // Add security attributes
        webview.setAttribute('loading', 'lazy');
        webview.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
        
        // Security: Validate URL before loading
        if (url && url !== 'about:blank') {
            const sanitizedUrl = this.sanitizeUrl(url);
            webview.src = sanitizedUrl;
        } else {
            webview.src = 'about:blank';
        }
        
        // Add load event listener to handle navigation
        webview.addEventListener('load', () => {
            this.handleTabLoad(tabId);
            // Clear any existing timeout for this tab
            if (this.tabLoadTimeouts[tabId]) {
                clearTimeout(this.tabLoadTimeouts[tabId]);
                delete this.tabLoadTimeouts[tabId];
            }
        });
        
        // Add error event listener for security violations
        webview.addEventListener('error', (e) => {
            console.warn('Security error in webview:', e);
            this.handleTabError(tabId, e, 'security');
        });
        
        // Add specific listener for blocked responses - check for load failures
        webview.addEventListener('loadstart', () => {
            const tab = this.tabs.find(t => t.id === tabId);
            if (tab) {
                tab.isLoading = true;
                this.updateTabTitle(tabId, 'Loading...');
            }
            
            // Set a timeout to detect if the page loads successfully
            const timeoutId = setTimeout(() => {
                try {
                    const doc = webview.contentDocument;
                    if (!doc || !doc.body || doc.body.children.length === 0) {
                        // Page might be blocked or failed to load
                        if (webview.src && !webview.src.startsWith('about:blank')) {
                            this.handleTabError(tabId, new Event('timeout'), 'network');
                        }
                    }
                } catch (e) {
                    // Cross-origin error - this is normal for most external sites
                    // Only treat as error if we have explicit evidence of blocking
                    if (webview.src && !webview.src.startsWith('about:blank') && !webview.src.startsWith('data:')) {
                        console.log('Cross-origin (normal for external sites):', webview.src);
                    }
                }
            }, 3000); // Reduced timeout for faster error detection
            
            this.tabLoadTimeouts[tabId] = timeoutId;
        });

        // Add load error event listener for network errors
        webview.addEventListener('load', () => {
            // Clear the loading timeout
            if (this.tabLoadTimeouts[tabId]) {
                clearTimeout(this.tabLoadTimeouts[tabId]);
                delete this.tabLoadTimeouts[tabId];
            }
            
            const tab = this.tabs.find(t => t.id === tabId);
            if (tab) {
                tab.isLoading = false;
            }
            
            // Check if iframe failed to load by examining its content
            try {
                const doc = webview.contentDocument;
                if (doc && doc.title && (doc.title.includes('blocked') || doc.title.includes('ERR_')) || 
                    (doc && doc.body && doc.body.textContent && 
                     (doc.body.textContent.includes('ERR_BLOCKED_BY_RESPONSE') || 
                      doc.body.textContent.includes('Access Denied') ||
                      doc.body.textContent.includes('blocked')))) {
                    this.handleTabError(tabId, new Event('blocked'), 'network');
                    return;
                }
                
                // Check for common error indicators in the page
                if (doc && doc.body) {
                    const bodyText = doc.body.textContent || '';
                    const bodyHtml = doc.body.innerHTML || '';
                    if (bodyText.includes('ERR_') || 
                        bodyHtml.includes('error') && bodyText.includes('blocked') ||
                        doc.title && doc.title.includes('Error')) {
                        this.handleTabError(tabId, new Event('blocked'), 'network');
                        return;
                    }
                }
                
                // If we can access the document, the page loaded successfully
                if (doc && doc.body && doc.body.children.length > 0) {
                    this.updateTabTitle(tabId, doc.title || webview.src);
                    return;
                }
            } catch (e) {
                // Cross-origin error - this is normal for external sites
                if (webview.src && !webview.src.startsWith('about:blank') && !webview.src.startsWith('data:')) {
                    console.log('Cross-origin (normal for external sites):', webview.src);
                }
            }
            
            // Only show error if we have explicit evidence of blocking in the error event
        });
        
        // Create tab object
        const newTab: BrowserTab = {
            id: tabId,
            url: url || '',
            title: url ? url : this.getString('newTab'),
            history: [],
            historyIndex: 0,
            isLoading: false,
            zoomLevel: 1.0,
            isPrivate: this.isPrivateMode,
            isPinned: false,
            element: webview,
            favicon: undefined,
            loadProgress: 0,
            securityLevel: 'unknown'
        };
        
        this.tabs.push(newTab);
        
        // Create tab element
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        if (newTab.isPinned) tabElement.classList.add('pinned');
        tabElement.id = 'tab-' + newTab.id;
        tabElement.draggable = true;
        
        const favicon = document.createElement('div');
        favicon.className = 'tab-favicon';
        if (newTab.favicon) {
            favicon.style.backgroundImage = `url(${newTab.favicon})`;
            favicon.style.backgroundSize = 'contain';
        }
        
        const title = document.createElement('span');
        title.className = 'tab-title';
        title.textContent = newTab.title;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'tab-close';
        
        // Create Ionicon element for close button
        const icon = document.createElement('ion-icon');
        icon.setAttribute('name', 'close-outline');
        closeBtn.appendChild(icon);
        
        closeBtn.style.display = newTab.isPinned ? 'none' : 'block';
        
        tabElement.appendChild(favicon);
        tabElement.appendChild(title);
        tabElement.appendChild(closeBtn);

        // Tab events
        tabElement.addEventListener('click', (e) => {
            if (!(e.target as HTMLElement).classList.contains('tab-close')) {
                this.switchToTab(newTab.id);
            }
        });

        tabElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showTabContextMenu(e, newTab);
        });

        tabElement.addEventListener('dragstart', (e) => {
            this.draggedTab = newTab.id;
            e.dataTransfer!.effectAllowed = 'move';
        });

        tabElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer!.dropEffect = 'move';
        });

        tabElement.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedTab && this.draggedTab !== newTab.id) {
                this.reorderTabs(this.draggedTab, newTab.id);
            }
            this.draggedTab = null;
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(newTab.id);
        });

        // Insert before the new tab button
        this.tabsContainer.insertBefore(tabElement, this.newTabBtn);
        
        // Add webview to container
        this.webviewContainer.appendChild(webview);
        
        // Switch to the new tab
        this.switchToTab(newTab.id);
        
        // If no URL provided, load welcome page
        if (!url) {
            this.loadWelcomePage(newTab.id);
        }
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
            
            // Clear any existing timeout for this tab
            if (this.tabLoadTimeouts[tabId]) {
                clearTimeout(this.tabLoadTimeouts[tabId]);
            }
            
            // Set a timeout for page loading
            this.tabLoadTimeouts[tabId] = setTimeout(() => {
                if (tab && tab.isLoading) {
                    this.handleTabError(tabId, new Event('timeout'), 'network');
                }
            }, 15000); // 15 second timeout for faster error detection
            
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
            <div class="error-icon">⚠️</div>
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
            
            <button class="toggle-details" onclick="var details = document.getElementById('technical-details'); details.style.display = details.style.display === 'none' ? 'block' : 'none'">
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
                🔄 Try Again
            </button>
            <button class="btn btn-secondary" onclick="window.history.back()">
                ← Go Back
            </button>
            <button class="btn btn-secondary" onclick="window.open('${pageError.url}', '_blank')">
                🌐 Open in External Browser
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

    private getGreeting(): string {
        const hour = new Date().getHours();
        const greetingKey = hour < 12 ? 'goodMorning' : hour < 17 ? 'goodAfternoon' : hour < 21 ? 'goodEvening' : 'goodNight';
        return this.getString(greetingKey);
    }

    private getString(key: string, params?: string[]): string {
        const translation = this.strings[key]?.[this.currentLanguage] || this.strings[key]?.en || key;
        if (params && params.length > 0) {
            return translation.replace(/\{(\d+)\}/g, (match, index) => params[parseInt(index)] || '');
        }
        return translation;
    }

    private setLanguage(languageCode: string): void {
        const language = this.languages.find(lang => lang.code === languageCode);
        if (language) {
            this.currentLanguage = languageCode;
            localStorage.setItem('browser_language', languageCode);
            this.updateUILanguage();
            this.updateStatus(`Language changed to ${language.name} (${language.nativeName})`);
        }
    }

    private detectLanguage(): string {
        // Try to detect language from browser/system
        const browserLang = navigator.language || 'en';
        const savedLang = localStorage.getItem('browser_language');
        
        // Check if saved language is supported
        if (savedLang && this.languages.find(lang => lang.code === savedLang)) {
            return savedLang;
        }
        
        // Try to match browser language
        const langCode = browserLang.split('-')[0];
        if (this.languages.find(lang => lang.code === langCode)) {
            return langCode;
        }
        
        return 'en'; // Default to English
    }

    private updateUILanguage(): void {
        // Update all UI elements with current language
        this.updateTabTitles();
        this.updateButtonTitles();
        this.updateStatusText();
        // Update welcome page if currently visible
        const activeTab = this.tabs.find(t => t.id === this.activeTabId);
        if (activeTab && activeTab.url === 'khoj://home') {
            this.loadWelcomePage(this.activeTabId);
        }
    }

    private updateTabTitles(): void {
        // Update tab titles for new tabs, close buttons, etc.
        document.querySelectorAll('.tab-title').forEach(element => {
            const tabElement = element.closest('.tab');
            if (tabElement) {
                const tabId = tabElement.id.replace('tab-', '');
                const tab = this.tabs.find(t => t.id === tabId);
                if (tab && tab.title === 'New Tab') {
                    element.textContent = this.getString('newTab');
                }
            }
        });
    }

    private updateButtonTitles(): void {
        // Update button texts
        const buttons = {
            'bookmark-btn': this.getString('bookmarks'),
            'downloads-btn': this.getString('downloads'),
            'dev-tools-btn': this.getString('devTools'),
            'settings-btn': this.getString('settings'),
            'new-tab-btn': this.getString('newTab')
        };
        
        Object.entries(buttons).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element && element.textContent !== text) {
                element.textContent = text;
            }
        });
    }

    private updateStatusText(): void {
        // Update status text elements
        const statusTexts = {
            'status-text': 'Ready',
            'loading-text': 'Loading...'
        };
        
        Object.entries(statusTexts).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element && element.textContent !== text) {
                element.textContent = text;
            }
        });
    }

    private createLanguageSwitcher(): void {
        // Create language switcher dropdown
        const languageSwitcher = document.createElement('div');
        languageSwitcher.id = 'language-switcher';
        languageSwitcher.className = 'language-switcher';
        languageSwitcher.innerHTML = `
            <select id="language-select" class="language-select">
                ${this.languages.map(lang => `
                    <option value="${lang.code}" ${lang.code === this.currentLanguage ? 'selected' : ''}>
                        ${lang.nativeName} (${lang.name})
                    </option>
                `).join('')}
            </select>
        `;
        
        // Add to header
        const header = document.querySelector('.header');
        if (header) {
            header.appendChild(languageSwitcher);
        }
        
        // Add change event listener
        const languageSelect = document.getElementById('language-select') as HTMLSelectElement;
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                const target = e.target as HTMLSelectElement;
                this.setLanguage(target.value);
            });
        }
    }

    private generateWelcomePageHtml(): string {
        const currentTime = new Date().toLocaleString();
        const browserVersion = '1.0.0';
        const greeting = this.getGreeting();
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Tab - Khoj Browser</title>
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
            color: #333;
            overflow-x: hidden;
            position: relative;
        }
        
        .background-pattern {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.1;
            background-image: 
                radial-gradient(circle at 20% 80%, white 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, white 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, white 0%, transparent 50%);
            z-index: 0;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 20px;
            position: relative;
            z-index: 1;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            color: white;
        }
        
        .greeting {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #fff, #f8f9fa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .date-time {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 30px;
        }
        
        .search-section {
            max-width: 600px;
            margin: 0 auto 40px;
            position: relative;
        }
        
        .search-container {
            position: relative;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 50px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            backdrop-filter: blur(20px);
            transition: all 0.3s ease;
        }
        
        .search-container:hover {
            transform: translateY(-2px);
            box-shadow: 0 25px 70px rgba(0,0,0,0.2);
        }
        
        .search-input {
            width: 100%;
            padding: 20px 60px 20px 60px;
            border: none;
            border-radius: 50px;
            font-size: 18px;
            background: transparent;
            outline: none;
        }
        
        .search-icon {
            position: absolute;
            left: 25px;
            top: 50%;
            transform: translateY(-50%);
            color: #667eea;
            font-size: 24px;
        }
        
        .search-shortcuts {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            gap: 8px;
        }
        
        .shortcut-key {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            border: 1px solid rgba(102, 126, 234, 0.3);
        }
        
        .quick-access {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .widget {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            backdrop-filter: blur(20px);
            transition: all 0.3s ease;
        }
        
        .widget:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 50px rgba(0,0,0,0.15);
        }
        
        .widget-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        
        .widget-title {
            font-size: 20px;
            font-weight: 600;
            color: #343a40;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .widget-icon {
            color: #667eea;
            font-size: 24px;
        }
        
        .quick-links {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
        }
        
        .quick-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 15px;
            border-radius: 12px;
            text-decoration: none;
            color: #343a40;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .quick-link:hover {
            background: rgba(102, 126, 234, 0.1);
            transform: translateY(-3px);
        }
        
        .quick-link-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            font-size: 24px;
            color: white;
        }
        
        .quick-link-title {
            font-size: 14px;
            font-weight: 500;
            line-height: 1.2;
        }
        
        .recent-tabs {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .recent-tab {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .recent-tab:hover {
            background: rgba(102, 126, 234, 0.1);
        }
        
        .tab-favicon {
            width: 24px;
            height: 24px;
            border-radius: 4px;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #667eea;
        }
        
        .tab-info {
            flex: 1;
            min-width: 0;
        }
        
        .tab-title {
            font-size: 14px;
            font-weight: 500;
            color: #343a40;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .tab-url {
            font-size: 12px;
            color: #6c757d;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .bookmarks-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .bookmark-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .bookmark-item:hover {
            background: rgba(102, 126, 234, 0.1);
        }
        
        .weather-widget {
            text-align: center;
        }
        
        .weather-display {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin-bottom: 15px;
        }
        
        .weather-icon {
            font-size: 48px;
            color: #667eea;
        }
        
        .weather-info {
            text-align: left;
        }
        
        .temperature {
            font-size: 36px;
            font-weight: 700;
            color: #343a40;
        }
        
        .weather-description {
            font-size: 14px;
            color: #6c757d;
            text-transform: capitalize;
        }
        
        .weather-location {
            font-size: 16px;
            color: #6c757d;
            margin-bottom: 10px;
        }
        
        .stats-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 40px;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            color: white;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .stat-number {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .floating-shapes {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
            pointer-events: none;
        }
        
        .shape {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            animation: float 8s ease-in-out infinite;
        }
        
        .shape:nth-child(1) {
            width: 300px;
            height: 300px;
            top: 10%;
            left: 10%;
            animation-delay: 0s;
        }
        
        .shape:nth-child(2) {
            width: 200px;
            height: 200px;
            top: 60%;
            right: 10%;
            animation-delay: 2s;
        }
        
        .shape:nth-child(3) {
            width: 150px;
            height: 150px;
            top: 30%;
            right: 20%;
            animation-delay: 4s;
        }
        
        .shape:nth-child(4) {
            width: 100px;
            height: 100px;
            bottom: 20%;
            left: 30%;
            animation-delay: 6s;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 20px 15px;
            }
            
            .greeting {
                font-size: 36px;
            }
            
            .quick-access {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .quick-links {
                grid-template-columns: repeat(3, 1fr);
            }
            
            .stats-row {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="background-pattern"></div>
    <div class="floating-shapes">
        <div class="shape"></div>
        <div class="shape"></div>
        <div class="shape"></div>
        <div class="shape"></div>
    </div>
    
    <div class="container">
        <header class="header">
            <h1 class="greeting">${greeting}</h1>
            <div class="date-time">${currentTime}</div>
        </header>
        
        <section class="search-section">
            <div class="search-container">
                <ion-icon name="search" class="search-icon"></ion-icon>
                <input type="text" class="search-input" placeholder="Search the web or enter a URL..." id="home-search" autofocus>
                <div class="search-shortcuts">
                    <span class="shortcut-key">Ctrl</span>
                    <span class="shortcut-key">K</span>
                </div>
            </div>
        </section>
        
        <div class="quick-access">
            <div class="widget">
                <div class="widget-header">
                    <h3 class="widget-title">
                        <ion-icon name="globe" class="widget-icon"></ion-icon>
                        Quick Access
                    </h3>
                </div>
                <div class="quick-links" id="quick-links">
                    <a class="quick-link" data-url="https://github.com">
                        <div class="quick-link-icon" style="background: #333;">
                            <ion-icon name="logo-github"></ion-icon>
                        </div>
                        <span class="quick-link-title">GitHub</span>
                    </a>
                    <a class="quick-link" data-url="https://stackoverflow.com">
                        <div class="quick-link-icon" style="background: #f48024;">
                            <ion-icon name="logo-stackoverflow"></ion-icon>
                        </div>
                        <span class="quick-link-title">Stack Overflow</span>
                    </a>
                    <a class="quick-link" data-url="https://youtube.com">
                        <div class="quick-link-icon" style="background: #ff0000;">
                            <ion-icon name="logo-youtube"></ion-icon>
                        </div>
                        <span class="quick-link-title">YouTube</span>
                    </a>
                    <a class="quick-link" data-url="https://twitter.com">
                        <div class="quick-link-icon" style="background: #1da1f2;">
                            <ion-icon name="logo-twitter"></ion-icon>
                        </div>
                        <span class="quick-link-title">Twitter</span>
                    </a>
                    <a class="quick-link" data-url="https://linkedin.com">
                        <div class="quick-link-icon" style="background: #0077b5;">
                            <ion-icon name="logo-linkedin"></ion-icon>
                        </div>
                        <span class="quick-link-title">LinkedIn</span>
                    </a>
                    <a class="quick-link" data-url="https://reddit.com">
                        <div class="quick-link-icon" style="background: #ff4500;">
                            <ion-icon name="logo-reddit"></ion-icon>
                        </div>
                        <span class="quick-link-title">Reddit</span>
                    </a>
                </div>
            </div>
            
            <div class="widget">
                <div class="widget-header">
                    <h3 class="widget-title">
                        <ion-icon name="time" class="widget-icon"></ion-icon>
                        Recent Tabs
                    </h3>
                </div>
                <div class="recent-tabs" id="recent-tabs">
                    <div class="recent-tab">
                        <div class="tab-favicon">
                            <ion-icon name="globe"></ion-icon>
                        </div>
                        <div class="tab-info">
                            <div class="tab-title">No recent tabs</div>
                            <div class="tab-url">Start browsing to see your recent tabs here</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="widget">
                <div class="widget-header">
                    <h3 class="widget-title">
                        <ion-icon name="bookmarks" class="widget-icon"></ion-icon>
                        Recent Bookmarks
                    </h3>
                </div>
                <div class="bookmarks-list" id="bookmarks-list">
                    <div class="bookmark-item">
                        <div class="tab-favicon">
                            <ion-icon name="bookmark"></ion-icon>
                        </div>
                        <div class="tab-info">
                            <div class="tab-title">No bookmarks yet</div>
                            <div class="tab-url">Bookmark pages to see them here</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="widget weather-widget">
                <div class="widget-header">
                    <h3 class="widget-title">
                        <ion-icon name="cloudy" class="widget-icon"></ion-icon>
                        Weather
                    </h3>
                </div>
                <div class="weather-location" id="weather-location">Detecting location...</div>
                <div class="weather-display">
                    <ion-icon name="sunny" class="weather-icon" id="weather-icon"></ion-icon>
                    <div class="weather-info">
                        <div class="temperature" id="temperature">--°</div>
                        <div class="weather-description" id="weather-description">Loading...</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="stats-row">
            <div class="stat-card">
                <div class="stat-number" id="tab-count">1</div>
                <div class="stat-label">Active Tabs</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="bookmark-count">0</div>
                <div class="stat-label">Bookmarks</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="download-count">0</div>
                <div class="stat-label">Downloads</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="session-time">0m</div>
                <div class="stat-label">Session Time</div>
            </div>
        </div>
    </div>
    
    <script>
        let sessionStartTime = Date.now();
        let weatherData = null;
        
        // Get greeting based on time of day
        function getGreeting() {
            const hour = new Date().getHours();
            if (hour < 12) return 'Good Morning! ☀️';
            if (hour < 17) return 'Good Afternoon! 🌤️';
            if (hour < 21) return 'Good Evening! 🌅';
            return 'Good Night! 🌙';
        }
        
        // Update session time
        function updateSessionTime() {
            const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000 / 60);
            const hours = Math.floor(elapsed / 60);
            const minutes = elapsed % 60;
            
            let timeString = '';
            if (hours > 0) {
                timeString = \`\${hours}h \${minutes}m\`;
            } else {
                timeString = \`\${minutes}m\`;
            }
            
            document.getElementById('session-time').textContent = timeString;
        }
        
        // Initialize weather
        function initWeather() {
            // Simulate weather data (in real app, you'd call a weather API)
            setTimeout(() => {
                const weatherConditions = [
                    { icon: 'sunny', temp: 72, desc: 'Clear Sky', location: 'San Francisco, CA' },
                    { icon: 'partly-sunny', temp: 68, desc: 'Partly Cloudy', location: 'New York, NY' },
                    { icon: 'cloudy', temp: 65, desc: 'Cloudy', location: 'London, UK' },
                    { icon: 'rainy', temp: 60, desc: 'Light Rain', location: 'Seattle, WA' }
                ];
                
                const weather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
                
                document.getElementById('weather-location').textContent = weather.location;
                document.getElementById('weather-icon').setAttribute('name', weather.icon);
                document.getElementById('temperature').textContent = \`\${weather.temp}°F\`;
                document.getElementById('weather-description').textContent = weather.desc;
            }, 2000);
        }
        
        // Handle search
        function navigateToSearch() {
            const searchInput = document.getElementById('home-search');
            const query = searchInput.value.trim();
            
            if (query) {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                        type: 'navigate-home-search',
                        query: query,
                        timestamp: Date.now()
                    }, '*');
                }
            }
        }
        
        // Handle quick link clicks
        function handleQuickLinkClick(url) {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'open-link',
                    url: url,
                    timestamp: Date.now()
                }, '*');
            }
        }
        
        // Update stats
        function updateStats() {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'get-home-stats',
                    timestamp: Date.now()
                }, '*');
            }
        }
        
        // Listen for messages from parent
        window.addEventListener('message', function(event) {
            switch (event.data.type) {
                case 'home-stats-update':
                    document.getElementById('tab-count').textContent = event.data.tabs || '1';
                    document.getElementById('bookmark-count').textContent = event.data.bookmarks || '0';
                    document.getElementById('download-count').textContent = event.data.downloads || '0';
                    
                    // Update recent tabs and bookmarks
                    if (event.data.recentTabs) {
                        updateRecentTabs(event.data.recentTabs);
                    }
                    if (event.data.recentBookmarks) {
                        updateBookmarks(event.data.recentBookmarks);
                    }
                    break;
                    
                case 'recent-tabs-update':
                    updateRecentTabs(event.data.tabs || []);
                    break;
                    
                case 'bookmarks-update':
                    updateBookmarks(event.data.bookmarks || []);
                    break;
            }
        });
        
        // Update recent tabs display
        function updateRecentTabs(tabs) {
            const container = document.getElementById('recent-tabs');
            
            if (tabs.length === 0) {
                container.innerHTML = \`
                    <div class="recent-tab">
                        <div class="tab-favicon">
                            <ion-icon name="globe"></ion-icon>
                        </div>
                        <div class="tab-info">
                            <div class="tab-title">No recent tabs</div>
                            <div class="tab-url">Start browsing to see your recent tabs here</div>
                        </div>
                    </div>
                \`;
                return;
            }
            
            container.innerHTML = tabs.slice(0, 5).map(tab => \`
                <div class="recent-tab" onclick="handleQuickLinkClick('\${tab.url}')">
                    <div class="tab-favicon">
                        \${tab.favicon ? \`<img src="\${tab.favicon}" style="width: 16px; height: 16px;">\` : '<ion-icon name="globe"></ion-icon>'}
                    </div>
                    <div class="tab-info">
                        <div class="tab-title">\${tab.title}</div>
                        <div class="tab-url">\${tab.url}</div>
                    </div>
                </div>
            \`).join('');
        }
        
        // Update bookmarks display
        function updateBookmarks(bookmarks) {
            const container = document.getElementById('bookmarks-list');
            
            if (bookmarks.length === 0) {
                container.innerHTML = \`
                    <div class="bookmark-item">
                        <div class="tab-favicon">
                            <ion-icon name="bookmark"></ion-icon>
                        </div>
                        <div class="tab-info">
                            <div class="tab-title">No bookmarks yet</div>
                            <div class="tab-url">Bookmark pages to see them here</div>
                        </div>
                    </div>
                \`;
                return;
            }
            
            container.innerHTML = bookmarks.slice(0, 5).map(bookmark => \`
                <div class="bookmark-item" onclick="handleQuickLinkClick('\${bookmark.url}')">
                    <div class="tab-favicon">
                        \${bookmark.favicon ? \`<img src="\${bookmark.favicon}" style="width: 16px; height: 16px;">\` : '<ion-icon name="bookmark"></ion-icon>'}
                    </div>
                    <div class="tab-info">
                        <div class="tab-title">\${bookmark.title}</div>
                        <div class="tab-url">\${bookmark.url}</div>
                    </div>
                </div>
            \`).join('');
        }
        
        // Initialize event listeners
        document.addEventListener('DOMContentLoaded', function() {
            // Search functionality
            const searchInput = document.getElementById('home-search');
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    navigateToSearch();
                }
            });
            
            // Quick link clicks
            document.querySelectorAll('.quick-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const url = this.getAttribute('data-url');
                    handleQuickLinkClick(url);
                });
            });
            
            // Keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    searchInput.focus();
                    searchInput.select();
                }
            });
            
            // Initialize
            updateStats();
            initWeather();
            
            // Update session time every minute
            setInterval(updateSessionTime, 60000);
            updateSessionTime();
            
            // Update stats every 10 seconds
            setInterval(updateStats, 10000);
        });
        
        // Add interactive animations
        document.querySelectorAll('.widget').forEach(widget => {
            widget.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            widget.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
        
        // Parallax effect on mouse move
        document.addEventListener('mousemove', function(e) {
            const shapes = document.querySelectorAll('.shape');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 15;
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
            downloads: this.downloads.length,
            recentTabs: this.tabs.slice(-5).map(tab => ({
                id: tab.id,
                title: tab.title,
                url: tab.url,
                favicon: tab.favicon
            })),
            recentBookmarks: this.bookmarks.slice(-5).map(bookmark => ({
                id: bookmark.id,
                title: bookmark.title,
                url: bookmark.url,
                favicon: bookmark.favicon
            }))
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
                id: this.generateBookmarkId(),
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
        this.updatePerformancePanel();
        this.updateSecurityPanel();
    }

    private updateConsoleFilterUI(): void {
        document.querySelectorAll('.console-filter').forEach(btn => {
            const level = (btn as HTMLElement).dataset.level;
            if (level === this.activeConsoleFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    private updateNetworkFilterUI(): void {
        document.querySelectorAll('.network-filter').forEach(btn => {
            const type = (btn as HTMLElement).dataset.type;
            if (type === this.activeNetworkFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    private togglePerformanceRecording(): void {
        this.isRecordingPerformance = !this.isRecordingPerformance;
        const recordBtn = document.getElementById('perf-record');
        if (recordBtn) {
            if (this.isRecordingPerformance) {
                recordBtn.classList.add('recording');
                recordBtn.innerHTML = '<ion-icon name="stop-outline"></ion-icon> Stop';
                this.startPerformanceRecording();
            } else {
                recordBtn.classList.remove('recording');
                recordBtn.innerHTML = '<ion-icon name="radio-outline"></ion-icon> Record';
                this.stopPerformanceRecording();
            }
        }
    }

    private startPerformanceRecording(): void {
        // Clear existing entries
        this.performanceEntries = [];
        
        // Start monitoring performance
        this.performanceMonitoringInterval = setInterval(() => {
            const tab = this.tabs.find(t => t.id === this.activeTabId);
            if (tab && tab.isLoading) {
                const entry: CustomPerformanceEntry = {
                    perfName: `Page Load - ${tab.url}`,
                    perfType: 'navigation',
                    perfStartTime: Date.now() - 1000,
                    perfDuration: 1000,
                    details: { url: tab.url, loadProgress: tab.loadProgress },
                    toJSON: () => JSON.stringify({
                        name: `Page Load - ${tab.url}`,
                        type: 'navigation',
                        startTime: Date.now() - 1000,
                        duration: 1000,
                        details: { url: tab.url, loadProgress: tab.loadProgress }
                    })
                };
                this.performanceEntries.push(entry);
                this.updatePerformancePanel();
            }
        }, 1000);
    }

    private stopPerformanceRecording(): void {
        if (this.performanceMonitoringInterval) {
            clearInterval(this.performanceMonitoringInterval);
            this.performanceMonitoringInterval = null;
        }
    }

    private updatePerformancePanel(): void {
        const perfDetails = document.getElementById('perf-details');
        const perfTimeline = document.getElementById('perf-timeline');
        
        if (perfDetails) {
            const latestMetrics = this.performanceMetrics[this.performanceMetrics.length - 1];
            if (latestMetrics) {
                perfDetails.innerHTML = `
                    <div class="perf-summary">
                        <h4>Performance Summary</h4>
                        <div class="perf-metric">
                            <span>CPU Usage:</span>
                            <span>${latestMetrics.cpuUsage.toFixed(1)}%</span>
                        </div>
                        <div class="perf-metric">
                            <span>Memory:</span>
                            <span>${latestMetrics.memoryUsage.used.toFixed(1)}MB (${latestMetrics.memoryUsage.percentage}%)</span>
                        </div>
                        <div class="perf-metric">
                            <span>Network Requests:</span>
                            <span>${latestMetrics.networkActivity.requestsCount}</span>
                        </div>
                        <div class="perf-metric">
                            <span>Render Time:</span>
                            <span>${latestMetrics.renderTime.toFixed(1)}ms</span>
                        </div>
                        <div class="perf-metric">
                            <span>Active Tabs:</span>
                            <span>${latestMetrics.activeTabs}</span>
                        </div>
                    </div>
                    <div class="perf-entries">
                        <h4>Performance Entries (${this.performanceEntries.length})</h4>
                        ${this.performanceEntries.map(entry => `
                            <div class="perf-entry">
                                <strong>${entry.perfName}</strong><br>
                                Type: ${entry.perfType} | Duration: ${entry.perfDuration}ms
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
        
        if (perfTimeline) {
            // Simple timeline visualization
            perfTimeline.innerHTML = `
                <div class="timeline-container">
                    ${this.performanceEntries.map((entry, index) => `
                        <div class="timeline-bar" style="left: ${(index / Math.max(this.performanceEntries.length - 1, 1)) * 90}%; width: 5px; height: ${Math.min(entry.perfDuration / 10, 100)}px; background: #4285f4;"></div>
                    `).join('')}
                </div>
            `;
        }
    }

    private startElementInspection(): void {
        this.updateStatus('Click on an element to inspect it');
        // In a real implementation, this would enable element selection mode
        // For now, we'll just show the current DOM tree
        this.updateElementsTree();
    }

    private searchElements(query: string): void {
        const elementsTree = document.getElementById('elements-tree');
        if (!elementsTree || !query) return;
        
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;
        
        try {
            const doc = tab.element.contentDocument;
            if (doc) {
                const elements = doc.querySelectorAll(query);
                const results = Array.from(elements).slice(0, 20).map(el => {
                    const tagName = el.tagName.toLowerCase();
                    const id = el.id ? `#${el.id}` : '';
                    const classes = el.className ? `.${el.className.split(' ').join('.')}` : '';
                    return `<div class="element-node search-result">&lt;${tagName}${id}${classes}&gt;</div>`;
                }).join('');
                
                elementsTree.innerHTML = results || '<div class="no-results">No elements found</div>';
            }
        } catch (error) {
            elementsTree.innerHTML = '<div>Cannot search DOM due to same-origin policy</div>';
        }
    }

    private showApplicationSection(section: string): void {
        const appContent = document.getElementById('app-content');
        if (!appContent) return;
        
        // Update tree selection
        document.querySelectorAll('.tree-node').forEach(node => {
            node.classList.remove('selected');
        });
        document.querySelector(`[data-section="${section}"]`)?.classList.add('selected');
        
        switch (section) {
            case 'local-storage':
                this.showLocalStorage();
                break;
            case 'session-storage':
                this.showSessionStorage();
                break;
            case 'cookies':
                this.showCookies();
                break;
            default:
                appContent.innerHTML = '<div class="no-section-selected">Select a section to view storage data</div>';
        }
    }

    private showLocalStorage(): void {
        const appContent = document.getElementById('app-content');
        if (!appContent) return;
        
        try {
            const storage = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    storage.push({ key, value: localStorage.getItem(key) || '' });
                }
            }
            
            appContent.innerHTML = `
                <div class="storage-view">
                    <h4>Local Storage (${storage.length} items)</h4>
                    <div class="storage-table">
                        <div class="storage-header">
                            <div>Key</div>
                            <div>Value</div>
                            <div>Actions</div>
                        </div>
                        ${storage.map(item => `
                            <div class="storage-row">
                                <div class="storage-key">${item.key}</div>
                                <div class="storage-value">${item.value.substring(0, 100)}${item.value.length > 100 ? '...' : ''}</div>
                                <div class="storage-actions">
                                    <button onclick="navigator.clipboard.writeText('${item.value}')">Copy</button>
                                    <button onclick="localStorage.removeItem('${item.key}'); location.reload()">Delete</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            appContent.innerHTML = '<div>Error accessing local storage</div>';
        }
    }

    private showSessionStorage(): void {
        const appContent = document.getElementById('app-content');
        if (!appContent) return;
        
        try {
            const storage = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key) {
                    storage.push({ key, value: sessionStorage.getItem(key) || '' });
                }
            }
            
            appContent.innerHTML = `
                <div class="storage-view">
                    <h4>Session Storage (${storage.length} items)</h4>
                    <div class="storage-table">
                        <div class="storage-header">
                            <div>Key</div>
                            <div>Value</div>
                            <div>Actions</div>
                        </div>
                        ${storage.map(item => `
                            <div class="storage-row">
                                <div class="storage-key">${item.key}</div>
                                <div class="storage-value">${item.value.substring(0, 100)}${item.value.length > 100 ? '...' : ''}</div>
                                <div class="storage-actions">
                                    <button onclick="navigator.clipboard.writeText('${item.value}')">Copy</button>
                                    <button onclick="sessionStorage.removeItem('${item.key}'); location.reload()">Delete</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            appContent.innerHTML = '<div>Error accessing session storage</div>';
        }
    }

    private showCookies(): void {
        const appContent = document.getElementById('app-content');
        if (!appContent) return;
        
        try {
            const cookies = document.cookie.split(';').map(cookie => {
                const [name, ...valueParts] = cookie.trim().split('=');
                return { name, value: valueParts.join('=') };
            }).filter(cookie => cookie.name);
            
            appContent.innerHTML = `
                <div class="storage-view">
                    <h4>Cookies (${cookies.length} items)</h4>
                    <div class="storage-table">
                        <div class="storage-header">
                            <div>Name</div>
                            <div>Value</div>
                            <div>Actions</div>
                        </div>
                        ${cookies.map(cookie => `
                            <div class="storage-row">
                                <div class="storage-key">${cookie.name}</div>
                                <div class="storage-value">${cookie.value.substring(0, 100)}${cookie.value.length > 100 ? '...' : ''}</div>
                                <div class="storage-actions">
                                    <button onclick="navigator.clipboard.writeText('${cookie.value}')">Copy</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            appContent.innerHTML = '<div>Error accessing cookies</div>';
        }
    }

    private updateSecurityPanel(): void {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;
        
        const connectionType = document.getElementById('connection-type');
        const certificateInfo = document.getElementById('certificate-info');
        const statusText = document.querySelector('.status-text');
        const statusIcon = document.querySelector('.status-icon');
        
        if (tab.url.startsWith('https://')) {
            if (connectionType) connectionType.textContent = 'HTTPS';
            if (certificateInfo) certificateInfo.textContent = 'Valid';
            if (statusText) statusText.textContent = 'Secure connection';
            if (statusIcon) statusIcon.textContent = '🔒';
        } else if (tab.url.startsWith('http://')) {
            if (connectionType) connectionType.textContent = 'HTTP';
            if (certificateInfo) certificateInfo.textContent = 'Not secure';
            if (statusText) statusText.textContent = 'Not secure';
            if (statusIcon) statusIcon.textContent = '⚠️';
        } else {
            if (connectionType) connectionType.textContent = 'Local';
            if (certificateInfo) certificateInfo.textContent = 'N/A';
            if (statusText) statusText.textContent = 'Local page';
            if (statusIcon) statusIcon.textContent = '📄';
        }
    }

    private toggleDevToolsDock(): void {
        const panel = document.getElementById('dev-tools-panel');
        if (!panel) return;
        
        // Toggle between right-docked and bottom-docked
        if (panel.style.right === '20px') {
            // Move to bottom
            panel.style.right = 'auto';
            panel.style.top = 'auto';
            panel.style.bottom = '0';
            panel.style.left = '0';
            panel.style.width = '100%';
            panel.style.height = '300px';
            panel.style.borderRadius = '0';
        } else {
            // Move to right
            panel.style.right = '20px';
            panel.style.top = '60px';
            panel.style.bottom = 'auto';
            panel.style.left = 'auto';
            panel.style.width = '800px';
            panel.style.height = '500px';
        }
    }

    private showDevToolsSettings(): void {
        // Create a simple settings panel for dev tools
        const settingsHtml = `
            <div style="padding: 16px;">
                <h3>Dev Tools Settings</h3>
                <div style="margin-bottom: 12px;">
                    <label>
                        <input type="checkbox" id="dev-auto-refresh" checked> Auto-refresh
                    </label>
                </div>
                <div style="margin-bottom: 12px;">
                    <label>
                        Theme:
                        <select id="dev-theme">
                            <option value="light" selected>Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </label>
                </div>
                <div style="margin-bottom: 12px;">
                    <label>
                        Font Size:
                        <select id="dev-font-size">
                            <option value="10px">10px</option>
                            <option value="12px" selected>12px</option>
                            <option value="14px">14px</option>
                        </select>
                    </label>
                </div>
                <button onclick="this.closest('.dev-tools-panel').querySelector('.dev-tools-content').style.display = 'block'">Close Settings</button>
            </div>
        `;
        
        const devToolsContent = document.querySelector('.dev-tools-content') as HTMLElement;
        if (devToolsContent) {
            devToolsContent.style.display = 'none';
            const settingsContainer = document.createElement('div');
            settingsContainer.innerHTML = settingsHtml;
            devToolsContent.parentElement?.appendChild(settingsContainer);
        }
    }

    private updateConsole(): void {
        const consoleOutput = document.getElementById('console-output')!;
        const filteredMessages = this.getFilteredConsoleMessages();
        consoleOutput.innerHTML = filteredMessages
            .map(msg => `<div class="console-${msg.level}">${msg.message}</div>`)
            .join('');
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    private getFilteredConsoleMessages(): ConsoleMessage[] {
        if (this.activeConsoleFilter === 'all') {
            return this.consoleMessages;
        }
        return this.consoleMessages.filter(msg => msg.level === this.activeConsoleFilter);
    }

    private updateNetworkLog(): void {
        const networkLog = document.getElementById('network-log')!;
        const filteredRequests = this.getFilteredNetworkRequests();
        networkLog.innerHTML = filteredRequests
            .map(req => `
                <div class="network-item">
                    <div class="table-cell">${this.getFileName(req.url)}</div>
                    <div class="table-cell network-status-${req.status}">${req.status}</div>
                    <div class="table-cell">${req.type}</div>
                    <div class="table-cell">${this.formatBytes(req.size)}</div>
                    <div class="table-cell">${req.duration}ms</div>
                    <div class="table-cell">
                        <div class="waterfall-bar" style="width: ${Math.min(req.duration / 10, 100)}px; background: ${this.getStatusColor(req.status)};"></div>
                    </div>
                </div>
            `)
            .join('');
    }

    private getFilteredNetworkRequests(): NetworkRequest[] {
        if (this.activeNetworkFilter === 'all') {
            return this.networkRequests;
        }
        return this.networkRequests.filter(req => req.type === this.activeNetworkFilter);
    }

    private getFileName(url: string): string {
        return url.split('/').pop() || url;
    }

    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    private getStatusColor(status: number): string {
        if (status >= 200 && status < 300) return '#0f9d58';
        if (status >= 300 && status < 400) return '#f4b400';
        return '#d93025';
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
        this.consoleMessages.push({
            level: 'log',
            message: `[${timestamp}] > ${command}`,
            timestamp: Date.now()
        });

        try {
            const result = (tab.element.contentWindow as any).eval(command);
            this.consoleMessages.push({
                level: 'log',
                message: `[${timestamp}] ${JSON.stringify(result)}`,
                timestamp: Date.now()
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.consoleMessages.push({
                level: 'error',
                message: `[${timestamp}] Error: ${errorMessage}`,
                timestamp: Date.now()
            });
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
        this.settings.searchEngine = (document.getElementById('search-engine-setting') as HTMLSelectElement).value as 'google' | 'bing' | 'duckduckgo' | 'custom';
        this.settings.restoreSession = (document.getElementById('restore-session-setting') as HTMLInputElement).checked;
        this.settings.downloadPath = (document.getElementById('download-path-setting') as HTMLInputElement).value;
        this.settings.enableJavaScript = (document.getElementById('enable-javascript-setting') as HTMLInputElement).checked;
        this.settings.enableCookies = (document.getElementById('enable-cookies-setting') as HTMLInputElement).checked;
        this.settings.enablePopups = (document.getElementById('enable-popups-setting') as HTMLInputElement).checked;
        this.settings.theme = (document.getElementById('theme-setting') as HTMLSelectElement).value as 'light' | 'dark' | 'auto';
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

    private showBookmarks(): void {
        // Ensure bookmarks bar is visible and highlight it
        this.bookmarksBar.classList.remove('collapsed');
        this.updateStatus('Bookmarks bar shown');
        
        // Scroll to bookmarks bar if needed
        this.bookmarksBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
            dateAdded: Date.now(),
            timestamp: Date.now()
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
        // Prevent shortcuts when user is typing in input fields
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            (activeElement as HTMLElement).contentEditable === 'true'
        );
        
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                // Tab Management
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
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    e.preventDefault();
                    const tabIndex = parseInt(e.key) - 1;
                    if (this.tabs[tabIndex]) {
                        this.switchToTab(this.tabs[tabIndex].id);
                    }
                    break;
                    
                // Navigation
                case 'r':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.reload(); // Force reload
                    } else {
                        this.reload();
                    }
                    break;
                case 'l':
                    e.preventDefault();
                    this.urlBar.focus();
                    this.urlBar.select();
                    break;
                case 'd':
                    e.preventDefault();
                    this.showBookmarks();
                    break;
                case 'h':
                    e.preventDefault();
                    this.loadWelcomePage(this.activeTabId);
                    break;
                    
                // Page Actions
                case 'f':
                    e.preventDefault();
                    this.showFindBar();
                    break;
                case 'p':
                    e.preventDefault();
                    this.printPage();
                    break;
                case 's':
                    e.preventDefault();
                    // Save page functionality
                    this.updateStatus('Save page feature coming soon');
                    break;
                    
                // Zoom
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
                    
                // Dev Tools
                case 'i':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.toggleDevTools();
                    }
                    break;
                case 'j':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.toggleDownloads();
                    }
                    break;
            }
        }
        
        // Function keys and other shortcuts
        switch (e.key) {
            // Navigation
            case 'F5':
                e.preventDefault();
                if (e.ctrlKey || e.metaKey) {
                    this.reload(); // Force reload
                } else {
                    this.reload();
                }
                break;
            case 'F6':
                e.preventDefault();
                this.urlBar.focus();
                this.urlBar.select();
                break;
                
            // Dev Tools
            case 'F12':
                e.preventDefault();
                this.toggleDevTools();
                break;
            case 'F11':
                e.preventDefault();
                // Toggle fullscreen functionality
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }
                break;
                
            // Navigation arrows
            case 'ArrowLeft':
                if (e.altKey) {
                    e.preventDefault();
                    this.goBack();
                }
                break;
            case 'ArrowRight':
                if (e.altKey) {
                    e.preventDefault();
                    this.goForward();
                }
                break;
                
            // Find
            case 'F3':
                e.preventDefault();
                if (e.shiftKey) {
                    this.findPrev();
                } else {
                    this.findNext();
                }
                break;
                
            // Escape
            case 'Escape':
                if (this.findBar.style.display !== 'none') {
                    this.hideFindBar();
                } else if (this.devToolsPanel.style.display !== 'none') {
                    this.hideDevTools();
                }
                break;
                
            // Tab switching (when not in input)
            case 'Tab':
                if (!isInputFocused && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    // Focus first interactive element in page
                    const tab = this.tabs.find(t => t.id === this.activeTabId);
                    if (tab && tab.element) {
                        tab.element.focus();
                    }
                }
                break;
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
        const icon = this.maximizeBtn.querySelector('ion-icon');
        if (icon) {
            icon.setAttribute('name', this.isMaximized ? 'contract-outline' : 'square-outline');
        }
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
            this.handleStorageError('save', 'bookmarks', error);
        }
    }

    private loadBookmarks(): void {
        try {
            const saved = localStorage.getItem('browser_bookmarks');
            if (saved) {
                this.bookmarks = JSON.parse(saved);
            }
        } catch (error) {
            this.handleStorageError('load', 'bookmarks', error);
        }
    }

    private saveDownloads(): void {
        try {
            localStorage.setItem('browser_downloads', JSON.stringify(this.downloads));
        } catch (error) {
            this.handleStorageError('save', 'downloads', error);
        }
    }

    private loadDownloads(): void {
        try {
            const saved = localStorage.getItem('browser_downloads');
            if (saved) {
                this.downloads = JSON.parse(saved);
            }
        } catch (error) {
            this.handleStorageError('load', 'downloads', error);
        }
    }

    private importBookmarks(filePath: string): void {
        try {
            if (window.electronAPI && window.electronAPI.readFile) {
                window.electronAPI.readFile(filePath).then((content: string) => {
                    try {
                        const importedBookmarks = JSON.parse(content);
                        
                        // Validate bookmark format
                        if (!Array.isArray(importedBookmarks)) {
                            throw new Error('Invalid bookmarks file format');
                        }
                        
                        const validBookmarks = importedBookmarks.filter(bookmark => 
                            bookmark.url && 
                            bookmark.title && 
                            typeof bookmark.url === 'string' && 
                            typeof bookmark.title === 'string'
                        );
                        
                        if (validBookmarks.length === 0) {
                            throw new Error('No valid bookmarks found in file');
                        }
                        
                        // Merge with existing bookmarks (avoid duplicates)
                        const existingUrls = new Set(this.bookmarks.map(b => b.url));
                        const newBookmarks = validBookmarks.filter(b => !existingUrls.has(b.url));
                        
                        this.bookmarks.push(...newBookmarks);
                        this.saveBookmarks();
                        this.updateBookmarksBar();
                        this.updateStatus(`Successfully imported ${newBookmarks.length} bookmarks from: ${filePath}`);
                        
                    } catch (parseError) {
                        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
                        this.updateStatus('Error parsing bookmarks file: ' + errorMessage);
                    }
                }).catch((error: unknown) => {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.updateStatus('Error reading bookmarks file: ' + errorMessage);
                });
            } else {
                // Fallback for web environment - use file input
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            try {
                                const importedBookmarks = JSON.parse(event.target?.result as string);
                                
                                if (!Array.isArray(importedBookmarks)) {
                                    throw new Error('Invalid bookmarks file format');
                                }
                                
                                const validBookmarks = importedBookmarks.filter(bookmark => 
                                    bookmark.url && 
                                    bookmark.title && 
                                    typeof bookmark.url === 'string' && 
                                    typeof bookmark.title === 'string'
                                );
                                
                                if (validBookmarks.length === 0) {
                                    throw new Error('No valid bookmarks found in file');
                                }
                                
                                const existingUrls = new Set(this.bookmarks.map(b => b.url));
                                const newBookmarks = validBookmarks.filter(b => !existingUrls.has(b.url));
                                
                                this.bookmarks.push(...newBookmarks);
                                this.saveBookmarks();
                                this.updateBookmarksBar();
                                this.updateStatus(`Successfully imported ${newBookmarks.length} bookmarks`);
                                
                            } catch (parseError) {
                            const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
                            this.updateStatus('Error parsing bookmarks file: ' + errorMessage);
                            }
                        };
                        reader.readAsText(file);
                    }
                };
                input.click();
            }
        } catch (error) {
            this.updateStatus('Error importing bookmarks: ' + error);
        }
    }

    private exportBookmarks(filePath: string): void {
        try {
            const bookmarksData = JSON.stringify(this.bookmarks, null, 2);
            
            if (window.electronAPI && window.electronAPI.writeFile) {
                window.electronAPI.writeFile(filePath, bookmarksData).then(() => {
                    this.updateStatus(`Successfully exported ${this.bookmarks.length} bookmarks to: ${filePath}`);
                }).catch((error: unknown) => {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.updateStatus('Error saving bookmarks file: ' + errorMessage);
                });
            } else {
                // Fallback for web environment - download as file
                const blob = new Blob([bookmarksData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'bookmarks.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.updateStatus(`Successfully exported ${this.bookmarks.length} bookmarks`);
            }
        } catch (error) {
            this.updateStatus('Error exporting bookmarks: ' + error);
        }
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
        
        // Clear any timeout for this tab
        if (this.tabLoadTimeouts[tabId]) {
            clearTimeout(this.tabLoadTimeouts[tabId]);
            delete this.tabLoadTimeouts[tabId];
        }

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

        // If no tabs left, close the browser
        if (this.tabs.length === 0) {
            this.closeWindow();
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
            this.handleStorageError('load', 'settings', error);
        }
    }

    private saveSettings(): void {
        try {
            localStorage.setItem('khoj_settings', JSON.stringify(this.settings));
        } catch (error) {
            this.handleStorageError('save', 'settings', error);
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
            this.handleStorageError('save', 'session', error);
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
            this.handleStorageError('load', 'session', error);
        }
    }

    private sanitizeUrl(url: string): string {
        try {
            // Basic URL validation and sanitization
            if (!url || typeof url !== 'string') {
                return 'about:blank';
            }

            // Trim whitespace
            url = url.trim();

            // Handle special cases
            if (url === 'about:blank' || url === 'about:newtab') {
                return url;
            }

            // Ensure URL has a protocol
            if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
                if (url.includes('.') && !url.includes(' ')) {
                    url = 'https://' + url;
                } else {
                    // Treat as search query
                    return 'about:blank';
                }
            }

            // Validate URL format
            const parsedUrl = new URL(url);
            
            // Block potentially dangerous protocols
            const allowedProtocols = ['http:', 'https:', 'file:', 'data:'];
            if (!allowedProtocols.includes(parsedUrl.protocol)) {
                console.warn('Blocked URL with disallowed protocol:', parsedUrl.protocol);
                return 'about:blank';
            }

            // Block localhost access in production (optional security measure)
            if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
                console.warn('Blocked localhost access for security');
                return 'about:blank';
            }

            return parsedUrl.toString();
        } catch (error) {
            console.warn('URL sanitization failed:', error);
            return 'about:blank';
        }
    }

    private handleTabError(tabId: string, error: Event, errorType: string = 'security'): void {
        const tab = this.tabs.find(t => t.id === tabId);
        if (tab) {
            tab.isLoading = false;
            tab.title = 'Error';
            
            // Create an error page to display based on error type
            let errorTitle = 'Error';
            let errorMessage = 'The page could not be loaded.';
            let errorDetails: string[] = [];
            let errorIcon = '⚠️';

            if (errorType === 'network') {
                errorTitle = 'Network Error';
                errorIcon = '🌐';
                errorMessage = 'The page could not be loaded due to network restrictions.';
                errorDetails = [
                    'ERR_BLOCKED_BY_RESPONSE - The request was blocked by the browser',
                    'Corporate firewall or security policies may be blocking this content',
                    'The website may have security policies that prevent embedding',
                    'Invalid SSL certificate or HTTPS issues'
                ];
            } else if (errorType === 'security') {
                errorTitle = 'Security Error';
                errorIcon = '🔒';
                errorMessage = 'The page could not be loaded due to security restrictions.';
                errorDetails = [
                    'Invalid or blocked URL protocol',
                    'Content Security Policy violations',
                    'Network security restrictions',
                    'Cross-origin restrictions'
                ];
            }

            const errorContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${errorTitle}</title>
                    <style>
                        body { 
                            font-family: system-ui, -apple-system, sans-serif; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            height: 100vh; 
                            margin: 0; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            color: #333; 
                        }
                        .error-container { 
                            text-align: center; 
                            max-width: 600px; 
                            padding: 3rem; 
                            background: white; 
                            border-radius: 16px; 
                            box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
                            backdrop-filter: blur(10px);
                        }
                        .error-icon { 
                            font-size: 4rem; 
                            margin-bottom: 1rem; 
                            display: block; 
                        }
                        h1 { 
                            color: #2c3e50; 
                            margin-bottom: 1rem; 
                            font-size: 2rem;
                            font-weight: 600;
                        }
                        .error-message {
                            color: #7f8c8d;
                            font-size: 1.1rem;
                            margin-bottom: 2rem;
                            line-height: 1.6;
                        }
                        .error-details {
                            background: #f8f9fa;
                            border-radius: 8px;
                            padding: 1.5rem;
                            margin-bottom: 2rem;
                            text-align: left;
                        }
                        .error-details h3 {
                            margin-top: 0;
                            margin-bottom: 1rem;
                            color: #495057;
                            font-size: 1rem;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        .error-details ul {
                            margin: 0;
                            padding-left: 1.5rem;
                        }
                        .error-details li {
                            margin-bottom: 0.5rem;
                            color: #6c757d;
                            line-height: 1.5;
                        }
                        .button-group {
                            display: flex;
                            gap: 1rem;
                            justify-content: center;
                            flex-wrap: wrap;
                        }
                        button { 
                            background: #007bff; 
                            color: white; 
                            border: none; 
                            padding: 0.75rem 1.5rem; 
                            border-radius: 8px; 
                            cursor: pointer; 
                            font-size: 1rem;
                            font-weight: 500;
                            transition: all 0.2s ease;
                        }
                        button:hover { 
                            background: #0056b3; 
                            transform: translateY(-1px);
                            box-shadow: 0 4px 8px rgba(0,123,255,0.3);
                        }
                        button.secondary {
                            background: #6c757d;
                        }
                        button.secondary:hover {
                            background: #545b62;
                            box-shadow: 0 4px 8px rgba(108,117,125,0.3);
                        }
                        .url-display {
                            background: #e9ecef;
                            padding: 0.5rem 1rem;
                            border-radius: 6px;
                            font-family: monospace;
                            font-size: 0.9rem;
                            word-break: break-all;
                            margin-bottom: 1rem;
                            color: #495057;
                        }
                    </style>
                </head>
                <body>
                    <div class="error-container">
                        <span class="error-icon">${errorIcon}</span>
                        <h1>${errorTitle}</h1>
                        <p class="error-message">${errorMessage}</p>
                        <div class="url-display">${tab.url}</div>
                        <div class="error-details">
                            <h3>Possible Causes:</h3>
                            <ul>
                                ${errorDetails.map(detail => `<li>${detail}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="button-group">
                            <button onclick="window.location.href='about:blank'">New Tab</button>
                            <button onclick="window.location.reload()" class="secondary">Try Again</button>
                            <button onclick="window.parent.postMessage({type: 'go-back'}, '*')" class="secondary">Go Back</button>
                        </div>
                    </div>
                    <script>
                        // Handle parent messages for navigation
                        window.addEventListener('message', function(event) {
                            if (event.data.type === 'go-back') {
                                history.back();
                            }
                        });
                    </script>
                </body>
                </html>
            `;

            const webview = document.getElementById(tabId) as HTMLIFrameElement;
            if (webview) {
                // Remove sandbox temporarily to allow srcdoc
                const originalSandbox = webview.getAttribute('sandbox');
                webview.removeAttribute('sandbox');
                
                // Set the error content
                webview.srcdoc = errorContent;
                
                // Re-apply sandbox after a short delay
                setTimeout(() => {
                    if (originalSandbox) {
                        webview.setAttribute('sandbox', originalSandbox);
                    }
                }, 100);
            }

            this.updateStatus(`${errorType} error in tab: ${tab.title}`);
            this.updateTabTitle(tabId, tab.title);
        }
    }
}

// Initialize the browser when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new KhojBrowser();
});
