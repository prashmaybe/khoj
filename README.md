# Advanced TypeScript Browser

A comprehensive web browser built from scratch using TypeScript and HTML5 with modern browser features.

## Features

### Core Browsing
- **Multi-Tab Interface**: Open, close, and switch between multiple tabs
- **Smart Navigation**: Back, Forward, Reload, and Home buttons with proper state management
- **Address Bar**: Enter URLs or search queries with intelligent URL formatting
- **Status Bar**: Shows loading status and current URL

### Advanced Features
- **Tab Management**: Create new tabs, close tabs, switch between tabs with visual indicators
- **Find on Page**: Search within page content with next/previous navigation
- **Zoom Controls**: Zoom in/out (50% to 200%) with visual zoom level indicator
- **Print Functionality**: Print current page content
- **Private/Incognito Mode**: Toggle private browsing mode
- **Download Manager**: Track and manage file downloads with progress indicators
- **Developer Tools**: Console, Network monitor, and Elements inspector
- **Bookmarks**: Add/remove bookmarks with localStorage persistence
- **History**: Per-tab browsing history with timestamps

### User Interface
- **Modern Design**: Clean, responsive interface with hover effects and transitions
- **Tab Bar**: Scrollable tab bar with close buttons and active tab indicators
- **Find Bar**: Slide-out find bar with search controls
- **Panels**: Collapsible downloads and developer tools panels
- **Error Handling**: User-friendly error messages and loading indicators

### Keyboard Shortcuts
- `Ctrl+T`: New tab
- `Ctrl+W`: Close current tab
- `Ctrl+Tab`: Switch to next tab
- `Ctrl+Shift+Tab`: Switch to previous tab
- `Ctrl+F`: Find on page
- `Ctrl+P`: Print page
- `Ctrl+L`: Focus address bar
- `Ctrl+Plus`: Zoom in
- `Ctrl+Minus`: Zoom out
- `Ctrl+0`: Reset zoom to 100%

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

3. Start a local server to serve the browser:
```bash
npm run serve
```

The browser will open at `http://localhost:8080`

## Development

- **Build**: `npm run build` - Compiles TypeScript to JavaScript
- **Watch**: `npm run dev` - Watches for TypeScript changes and rebuilds automatically
- **Serve**: `npm run serve` - Starts a local development server

## Architecture

The browser is built with:

- **TypeScript**: For type-safe JavaScript development with advanced interfaces
- **HTML5/CSS3**: Modern web standards for the UI with responsive design
- **iframe**: For rendering web content with sandboxing for security
- **localStorage**: For persisting bookmarks, history, and downloads

### Key Components

- `AdvancedBrowser` class: Main application logic with tab management
- `BrowserTab` interface: Tab state management with individual history and settings
- Tab System: Multi-tab browsing with independent state management
- Navigation System: URL parsing, history management, and navigation controls
- UI Components: Toolbar, tab bar, webview container, status bar, and panels
- Storage System: LocalStorage for bookmarks, history, and downloads persistence
- Developer Tools: Console, network monitoring, and DOM inspection

### Advanced Features Implementation

- **Tab Management**: Each tab maintains independent state, history, and zoom levels
- **Download Manager**: Simulated download system with progress tracking
- **Developer Tools**: Console for JavaScript execution, network request logging, DOM tree viewer
- **Private Mode**: Toggle for private browsing with visual indicators
- **Find Functionality**: In-page search with navigation controls
- **Zoom System**: Per-tab zoom levels with visual feedback

## Security Considerations

Due to browser security restrictions (same-origin policy), some features are limited:
- Cannot access content of cross-origin iframes
- Limited control over loaded content from different domains
- Some websites may block iframe embedding
- Console execution limited to same-origin pages

## File Structure

```
typescript-browser/
- src/
  - main.ts              # Original simple browser (deprecated)
  - advanced-browser.ts  # Advanced browser with all features
- index.html             # Browser UI with advanced layout
- package.json           # Dependencies and scripts
- tsconfig.json          # TypeScript configuration
- README.md              # This file
```

## Usage

1. **Basic Browsing**: Enter URLs in the address bar or use navigation buttons
2. **Tab Management**: Click the + button for new tabs, use × to close tabs
3. **Search**: Use Ctrl+F or Find button to search within pages
4. **Zoom**: Use zoom buttons or keyboard shortcuts to adjust page scale
5. **Bookmarks**: Bookmark pages for quick access (saved automatically)
6. **History**: View per-tab browsing history
7. **Downloads**: Open downloads panel to track file downloads
8. **Developer Tools**: Access console, network monitor, and DOM inspector
9. **Private Mode**: Toggle private browsing for enhanced privacy

## Limitations

- Same-origin policy restricts access to cross-origin content
- iframe sandboxing limits some web functionality
- Downloads are simulated for demonstration purposes
- Developer tools have limited functionality due to security restrictions
