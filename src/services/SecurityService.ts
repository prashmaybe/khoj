export interface ClearDataOptions {
  browsingHistory: boolean;
  cookies: boolean;
  cache: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  passwords: boolean;
  autofillData: boolean;
  timeRange: 'lastHour' | 'lastDay' | 'lastWeek' | 'lastMonth' | 'allTime';
}

// Chrome API types (for when running in Electron environment)
interface ChromeHistoryItem {
  url?: string;
  lastVisitTime?: number;
}

interface ChromeCookie {
  domain?: string;
  path?: string;
  name?: string;
  secure?: boolean;
  expirationDate?: number;
}

interface ChromePassword {
  origin?: string;
  username?: string;
  password?: string;
  dateCreated?: number;
  guid?: string;
}

interface ChromeCreditCard {
  guid?: string;
  useDate?: number;
}

// Global Chrome API declarations
declare global {
  interface Window {
    chrome?: {
      history?: {
        search: (query: any, callback: (results: ChromeHistoryItem[]) => void) => void;
        deleteRange: (range: any, callback: () => void) => void;
      };
      cookies?: {
        getAll: (details: any, callback: (cookies: ChromeCookie[]) => void) => void;
        remove: (details: any, callback?: () => void) => void;
      };
      browsingData?: {
        remove: (options: any, callback: () => void) => void;
      };
      passwords?: {
        getAll: (callback: (passwords: ChromePassword[]) => void) => void;
        remove: (details: any, callback?: () => void) => void;
      };
      autofill?: {
        getCreditCards: (callback: (creditCards: ChromeCreditCard[]) => void) => void;
        removeCreditCard: (details: any, callback?: () => void) => void;
      };
    };
  }
}

export interface SecuritySettings {
  httpsOnly: boolean;
  blockTrackers: boolean;
  blockCookies: boolean;
  clearDataOnClose: boolean;
  warnOnInsecureSites: boolean;
}

class SecurityService {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // HTTPS-Only Mode
  upgradeToHttps(url: string): string {
    if (!url) return url;
    
    // If already HTTPS, return as-is
    if (url.startsWith('https://')) return url;
    
    // If not HTTP, return as-is (could be data:, file:, etc.)
    if (!url.startsWith('http://')) return url;
    
    // Upgrade HTTP to HTTPS
    return url.replace('http://', 'https://');
  }

  isSecureUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async checkHttpsAvailability(url: string): Promise<boolean> {
    try {
      const httpsUrl = this.upgradeToHttps(url);
      const response = await fetch(httpsUrl, { 
        method: 'HEAD', 
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return response.ok || response.status < 400;
    } catch {
      return false;
    }
  }

  // Clear Browsing Data
  async clearBrowsingData(options: ClearDataOptions): Promise<void> {
    if (!this.isClient()) return;

    const now = Date.now();
    let cutoffTime = 0;

    // Calculate cutoff time based on selected range
    switch (options.timeRange) {
      case 'lastHour':
        cutoffTime = now - (60 * 60 * 1000);
        break;
      case 'lastDay':
        cutoffTime = now - (24 * 60 * 60 * 1000);
        break;
      case 'lastWeek':
        cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case 'lastMonth':
        cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case 'allTime':
        cutoffTime = 0;
        break;
    }

    // Clear browsing history (simplified implementation)
    if (options.browsingHistory && this.isClient()) {
      // Store browsing history in localStorage for this implementation
      const historyKey = 'khoj_browsing_history';
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const filteredHistory = history.filter((item: any) => {
        if (options.timeRange === 'allTime') return false;
        return item.timestamp && item.timestamp >= cutoffTime;
      });
      localStorage.setItem(historyKey, JSON.stringify(filteredHistory));
    }

    // Clear cookies (simplified implementation)
    if (options.cookies && this.isClient()) {
      const cookiesKey = 'khoj_cookies';
      const cookies = JSON.parse(localStorage.getItem(cookiesKey) || '[]');
      const filteredCookies = cookies.filter((cookie: any) => {
        if (options.timeRange === 'allTime') return false;
        return cookie.expirationDate && cookie.expirationDate < cutoffTime / 1000;
      });
      localStorage.setItem(cookiesKey, JSON.stringify(filteredCookies));
    }

    // Clear cache (simplified implementation)
    if (options.cache && this.isClient()) {
      const cacheKey = 'khoj_cache';
      const cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
      const filteredCache: any = {};
      
      Object.keys(cache).forEach(key => {
        const item = cache[key];
        if (options.timeRange !== 'allTime' && (!item.timestamp || item.timestamp >= cutoffTime)) {
          filteredCache[key] = item;
        }
      });
      
      localStorage.setItem(cacheKey, JSON.stringify(filteredCache));
    }

    // Clear localStorage
    if (options.localStorage && this.isClient()) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const data = JSON.parse(value);
            if (data.timestamp && data.timestamp < cutoffTime) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // If can't parse, check if it's old (simple heuristic)
          if (options.timeRange === 'allTime') {
            localStorage.removeItem(key);
          }
        }
      });
    }

    // Clear sessionStorage
    if (options.sessionStorage && this.isClient()) {
      sessionStorage.clear();
    }

    // Clear passwords (simplified implementation)
    if (options.passwords && this.isClient()) {
      const passwordsKey = 'khoj_passwords';
      const passwords = JSON.parse(localStorage.getItem(passwordsKey) || '[]');
      const filteredPasswords = passwords.filter((password: any) => {
        if (options.timeRange === 'allTime') return false;
        return password.dateCreated && password.dateCreated >= cutoffTime;
      });
      localStorage.setItem(passwordsKey, JSON.stringify(filteredPasswords));
    }

    // Clear autofill data (simplified implementation)
    if (options.autofillData && this.isClient()) {
      const autofillKey = 'khoj_autofill';
      const autofillData = JSON.parse(localStorage.getItem(autofillKey) || '{}');
      const filteredAutofill: any = {};
      
      Object.keys(autofillData).forEach(key => {
        const item = autofillData[key];
        if (options.timeRange !== 'allTime' && (!item.useDate || item.useDate >= cutoffTime)) {
          filteredAutofill[key] = item;
        }
      });
      
      localStorage.setItem(autofillKey, JSON.stringify(filteredAutofill));
    }
  }

  // Security settings management
  loadSecuritySettings(): SecuritySettings {
    if (!this.isClient()) {
      return this.getDefaultSecuritySettings();
    }

    try {
      const stored = localStorage.getItem('khoj_security_settings');
      return stored ? JSON.parse(stored) : this.getDefaultSecuritySettings();
    } catch {
      return this.getDefaultSecuritySettings();
    }
  }

  saveSecuritySettings(settings: Partial<SecuritySettings>): void {
    if (!this.isClient()) return;

    try {
      const currentSettings = this.loadSecuritySettings();
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem('khoj_security_settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving security settings:', error);
    }
  }

  private getDefaultSecuritySettings(): SecuritySettings {
    return {
      httpsOnly: false,
      blockTrackers: true,
      blockCookies: false,
      clearDataOnClose: false,
      warnOnInsecureSites: true,
    };
  }

  // Security indicators
  getSecurityLevel(url: string): 'secure' | 'warning' | 'insecure' {
    try {
      const urlObj = new URL(url);
      
      if (urlObj.protocol === 'https:') {
        return 'secure';
      } else if (urlObj.protocol === 'http:') {
        return 'insecure';
      } else {
        return 'warning';
      }
    } catch {
      return 'warning';
    }
  }

  // Tracker detection
  detectTrackers(document: Document): string[] {
    const trackerPatterns = [
      /google-analytics\.com/i,
      /doubleclick\.net/i,
      /facebook\.com/i,
      /googleadservices\.com/i,
      /googlesyndication\.com/i,
      /googletagmanager\.com/i,
    ];

    const detectedTrackers: string[] = [];
    const scripts = document.querySelectorAll('script');
    
    scripts.forEach(script => {
      const src = script.src || '';
      trackerPatterns.forEach(pattern => {
        if (pattern.test(src) && !detectedTrackers.includes(pattern.source)) {
          detectedTrackers.push(pattern.source);
        }
      });
    });

    return detectedTrackers;
  }

  // Cookie management (simplified implementation)
  getCookiesForDomain(domain: string): Promise<any[]> {
    return new Promise((resolve) => {
      if (this.isClient()) {
        const cookiesKey = 'khoj_cookies';
        const cookies = JSON.parse(localStorage.getItem(cookiesKey) || '[]');
        const domainCookies = cookies.filter((cookie: any) => 
          cookie.domain && cookie.domain.includes(domain)
        );
        resolve(domainCookies || []);
      } else {
        resolve([]);
      }
    });
  }

  clearCookiesForDomain(domain: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.isClient()) {
        const cookiesKey = 'khoj_cookies';
        const cookies = JSON.parse(localStorage.getItem(cookiesKey) || '[]');
        const remainingCookies = cookies.filter((cookie: any) => 
          !cookie.domain || !cookie.domain.includes(domain)
        );
        localStorage.setItem(cookiesKey, JSON.stringify(remainingCookies));
        resolve();
      } else {
        resolve();
      }
    });
  }

  // URL security checks
  isPhishingUrl(url: string): boolean {
    const phishingPatterns = [
      /bit\.ly\/[a-z0-9]+/i,
      /t\.co\/[a-z0-9]+/i,
      /goo\.gl\/[a-z0-9]+/i,
      /paypal\.com.*\.(tk|ml|ga|cf)/i,
      /microsoft.*\.(tk|ml|ga|cf)/i,
      /apple.*\.(tk|ml|ga|cf)/i,
    ];

    return phishingPatterns.some(pattern => pattern.test(url));
  }

  sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove tracking parameters
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
      trackingParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });

      return urlObj.toString();
    } catch {
      return url;
    }
  }
}

export const securityService = new SecurityService();
