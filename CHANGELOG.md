# Changelog

All notable changes to Khoj will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-15

### Added
- Cross-platform browser application built with React Native and Electron
- Multi-tab browsing with full navigation controls
- Bookmarks management with bookmarks bar
- History tracking and management
- Downloads with progress tracking
- Password manager with autofill functionality
- PDF viewer for local files
- Incognito/private browsing mode
- Clear browsing data functionality
- Keyboard shortcuts for efficient navigation
- Light and dark theme support
- Search engine selector with multiple options
- Security settings (HTTPS-only mode)
- Comprehensive keyboard shortcuts help
- Tab management features
- Lazy loading manager
- Image search integration

### Desktop (Electron) Features
- Windows support (NSIS installer + portable)
- macOS support (DMG + ZIP)
- Linux support (AppImage + DEB + RPM)
- Native file downloads with progress tracking
- PDF file opening with native viewer
- Incognito window support
- Security features (context isolation, web security)
- Download handler with auto-save to Downloads folder

### Mobile (React Native) Features
- Android platform support
- iOS platform support
- Cross-platform React Native architecture
- Web rendering via WebView

### Technical Improvements
- TypeScript for type safety
- Webpack for bundling
- Electron Forge for packaging
- Jest for testing
- React Native Web for cross-platform UI
- Comprehensive component architecture (atoms, molecules, organisms)
- Theme context for consistent styling
- Service layer for data persistence
- Keyboard shortcuts system
- Search engine integration
- Security service with configurable settings
- Password manager with encryption
- History and bookmarks storage
- Download storage with progress tracking

### Known Issues
- Mobile WebView integration needs real device testing
- Bundle size optimization needed (currently 693KB main bundle)
- No auto-update mechanism
- No crash reporting/analytics

### Security
- Context isolation enabled
- Web security enabled
- Node integration disabled
- HTTPS-only mode available
- Password encryption using crypto-js

## [Unreleased] - Planned Features

### Planned Enhancements
- Tab groups and organization
- Tab pinning
- Reading mode
- Advanced tracker blocking
- Extension system
- Custom themes with accent colors
- Font size controls
- Accessibility improvements
- Localization (i18n)
- Auto-update mechanism
- Analytics and crash reporting
- Cloud sync for bookmarks/history
- Reading list
- Note taking
- PDF annotation

### Mobile-Specific
- Gesture navigation
- Bottom address bar on mobile
- Reader view
- Offline mode
- Cross-device sync
