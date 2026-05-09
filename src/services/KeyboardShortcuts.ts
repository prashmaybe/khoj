export interface KeyboardShortcutHandlers {
  // Tab & Window Management
  onNewTab?: () => void;
  onReopenClosedTab?: () => void;
  onNewWindow?: () => void;
  onNewIncognitoWindow?: () => void;
  onCloseTab?: () => void;
  onCloseWindow?: () => void;
  onCycleTab?: (direction: 'forward' | 'backward') => void;
  onSwitchToTab?: (tabNumber: number) => void;
  onSwitchToLastTab?: () => void;
  
  // Address Bar
  onFocusAddressBar?: () => void;
  onSearchGoogle?: () => void;
  
  // Page Navigation & Display
  onGoBack?: () => void;
  onGoForward?: () => void;
  onReload?: () => void;
  onBookmarkPage?: () => void;
  onToggleBookmarksBar?: () => void;
  onOpenHistory?: () => void;
  onOpenDownloads?: () => void;
  onViewPageSource?: () => void;
  onOpenDevTools?: () => void;
  
  // Editing & General
  onFindText?: () => void;
  onPrintPage?: () => void;
  
  // Help
  onShowShortcutsHelp?: () => void;
}

export class KeyboardShortcuts {
  private handlers: KeyboardShortcutHandlers;
  private isMac: boolean;
  
  constructor(handlers: KeyboardShortcutHandlers) {
    this.handlers = handlers;
    this.isMac = typeof window !== 'undefined' && window.navigator.platform.toLowerCase().includes('mac');
  }
  
  public handleKeyDown = (event: KeyboardEvent): boolean => {
    const { ctrlKey, metaKey, shiftKey, altKey, key } = event;
    
    // On Mac, Command (metaKey) is used instead of Ctrl
    const modifierKey = this.isMac ? metaKey : ctrlKey;
    
    // Prevent default for handled shortcuts
    let handled = false;
    
    // Tab & Window Management
    if (modifierKey && !shiftKey && !altKey) {
      switch (key.toLowerCase()) {
        case 't':
          this.handlers.onNewTab?.();
          handled = true;
          break;
        case 'n':
          this.handlers.onNewWindow?.();
          handled = true;
          break;
        case 'w':
          this.handlers.onCloseTab?.();
          handled = true;
          break;
        case 'l':
          this.handlers.onFocusAddressBar?.();
          handled = true;
          break;
        case 'k':
        case 'e':
          this.handlers.onSearchGoogle?.();
          handled = true;
          break;
        case 'r':
          this.handlers.onReload?.();
          handled = true;
          break;
        case 'd':
          this.handlers.onBookmarkPage?.();
          handled = true;
          break;
        case 'h':
          this.handlers.onOpenHistory?.();
          handled = true;
          break;
        case 'j':
          this.handlers.onOpenDownloads?.();
          handled = true;
          break;
        case 'u':
          this.handlers.onViewPageSource?.();
          handled = true;
          break;
        case 'f':
          this.handlers.onFindText?.();
          handled = true;
          break;
        case 'p':
          this.handlers.onPrintPage?.();
          handled = true;
          break;
        case 'tab':
          this.handlers.onCycleTab?.('forward');
          handled = true;
          break;
        case '9':
          this.handlers.onSwitchToLastTab?.();
          handled = true;
          break;
      }
      
      // Number keys 1-8 for tab switching
      if (key >= '1' && key <= '8') {
        this.handlers.onSwitchToTab?.(parseInt(key));
        handled = true;
      }
    }
    
    // Shift + modifier combinations
    if (modifierKey && shiftKey && !altKey) {
      switch (key.toLowerCase()) {
        case 't':
          this.handlers.onReopenClosedTab?.();
          handled = true;
          break;
        case 'n':
          this.handlers.onNewIncognitoWindow?.();
          handled = true;
          break;
        case 'w':
          this.handlers.onCloseWindow?.();
          handled = true;
          break;
        case 'b':
          this.handlers.onToggleBookmarksBar?.();
          handled = true;
          break;
        case 'i':
          this.handlers.onOpenDevTools?.();
          handled = true;
          break;
        case 'tab':
          this.handlers.onCycleTab?.('backward');
          handled = true;
          break;
      }
    }
    
    // Alt key combinations
    if (altKey && !modifierKey && !shiftKey) {
      switch (key.toLowerCase()) {
        case 'd':
          this.handlers.onFocusAddressBar?.();
          handled = true;
          break;
        case 'arrowleft':
          this.handlers.onGoBack?.();
          handled = true;
          break;
        case 'arrowright':
          this.handlers.onGoForward?.();
          handled = true;
          break;
      }
    }
    
    // F5 for reload
    if (key === 'F5' && !modifierKey && !shiftKey && !altKey) {
      this.handlers.onReload?.();
      handled = true;
    }
    
    // F4 for close tab (Windows)
    if (key === 'F4' && !modifierKey && !shiftKey && !altKey && !this.isMac) {
      this.handlers.onCloseTab?.();
      handled = true;
    }
    
    // Ctrl+/ for shortcuts help
    if (modifierKey && key === '/') {
      this.handlers.onShowShortcutsHelp?.();
      handled = true;
    }
    
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    return handled;
  };
  
  public getShortcutDescription(shortcut: string): string {
    const isMac = this.isMac;
    const ctrl = isMac ? '⌘' : 'Ctrl';
    const alt = isMac ? '⌥' : 'Alt';
    const shift = 'Shift';
    
    const replacements: { [key: string]: string } = {
      'Ctrl': ctrl,
      'Alt': alt,
      'Shift': shift,
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'ArrowUp': '↑',
      'ArrowDown': '↓'
    };
    
    let result = shortcut;
    Object.keys(replacements).forEach((from) => {
      const to = replacements[from as keyof typeof replacements];
      result = result.replace(new RegExp(from, 'g'), to);
    });
    
    return result;
  }
  
  public getAllShortcuts(): { shortcut: string; description: string; category: string }[] {
    const isMac = this.isMac;
    const ctrl = isMac ? '⌘' : 'Ctrl';
    const alt = isMac ? '⌥' : 'Alt';
    
    return [
      // Tab & Window Management
      { shortcut: `${ctrl}+T`, description: 'Open a new tab', category: 'Tabs & Windows' },
      { shortcut: `${ctrl}+Shift+T`, description: 'Reopen the last closed tab', category: 'Tabs & Windows' },
      { shortcut: `${ctrl}+N`, description: 'Open a new window', category: 'Tabs & Windows' },
      { shortcut: `${ctrl}+Shift+N`, description: 'Open a new Incognito window', category: 'Tabs & Windows' },
      { shortcut: `${ctrl}+W`, description: 'Close current tab', category: 'Tabs & Windows' },
      { shortcut: `${ctrl}+Shift+W`, description: 'Close current window', category: 'Tabs & Windows' },
      { shortcut: `${ctrl}+Tab`, description: 'Cycle through tabs', category: 'Tabs & Windows' },
      { shortcut: `${ctrl}+Shift+Tab`, description: 'Cycle through tabs backward', category: 'Tabs & Windows' },
      { shortcut: `${ctrl}+1-8`, description: 'Switch to a specific tab', category: 'Tabs & Windows' },
      { shortcut: `${ctrl}+9`, description: 'Switch to the last tab', category: 'Tabs & Windows' },
      
      // Address Bar
      { shortcut: `${ctrl}+L`, description: 'Highlight address bar', category: 'Address Bar' },
      { shortcut: `${alt}+D`, description: 'Highlight address bar', category: 'Address Bar' },
      { shortcut: `${ctrl}+K`, description: 'Search Google', category: 'Address Bar' },
      { shortcut: `${ctrl}+E`, description: 'Search Google', category: 'Address Bar' },
      
      // Page Navigation & Display
      { shortcut: `${alt}+←`, description: 'Go back', category: 'Navigation' },
      { shortcut: `${alt}+→`, description: 'Go forward', category: 'Navigation' },
      { shortcut: `${ctrl}+R`, description: 'Reload page', category: 'Navigation' },
      { shortcut: 'F5', description: 'Reload page', category: 'Navigation' },
      { shortcut: `${ctrl}+D`, description: 'Bookmark current page', category: 'Navigation' },
      { shortcut: `${ctrl}+Shift+B`, description: 'Toggle bookmarks bar', category: 'Navigation' },
      { shortcut: `${ctrl}+H`, description: 'Open history', category: 'Navigation' },
      { shortcut: `${ctrl}+J`, description: 'Open downloads', category: 'Navigation' },
      { shortcut: `${ctrl}+U`, description: 'View page source', category: 'Navigation' },
      { shortcut: `${ctrl}+Shift+I`, description: 'Open Developer Tools', category: 'Navigation' },
      
      // Editing & General
      { shortcut: `${ctrl}+F`, description: 'Find text', category: 'General' },
      { shortcut: `${ctrl}+P`, description: 'Print page', category: 'General' },
    ];
  }
}
