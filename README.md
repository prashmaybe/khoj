# TypeScript Browser

A simple web browser built from scratch using TypeScript and HTML5.

## Features

- **Navigation Controls**: Back, Forward, Reload, and Home buttons
- **Address Bar**: Enter URLs or search queries
- **Bookmarks**: Add and remove bookmarks (saved in localStorage)
- **History**: Browse history with timestamps (saved in localStorage)
- **Status Bar**: Shows loading status and current URL
- **Error Handling**: Displays error messages for failed page loads
- **Modern UI**: Clean, responsive interface with hover effects

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

- **TypeScript**: For type-safe JavaScript development
- **HTML5/CSS3**: Modern web standards for the UI
- **iframe**: For rendering web content with sandboxing
- **localStorage**: For persisting bookmarks and history

### Key Components

- `Browser` class: Main application logic
- Navigation system: URL parsing and history management
- UI components: Toolbar, webview container, status bar
- Storage system: LocalStorage for bookmarks and history

## Limitations

Due to browser security restrictions (same-origin policy), some features are limited:
- Cannot access content of cross-origin iframes
- Limited control over loaded content
- Some websites may block iframe embedding

## Usage

1. Enter a URL in the address bar or search for something
2. Use navigation buttons to move through history
3. Bookmark pages for quick access
4. View browsing history
5. Reload pages or return to home (Google)

## File Structure

```
typescript-browser/
- src/
  - main.ts          # Main browser application logic
- index.html         # Browser UI and layout
- package.json       # Dependencies and scripts
- tsconfig.json      # TypeScript configuration
- README.md          # This file
```
