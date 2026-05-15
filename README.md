# Khoj - Cross-Platform Browser

A universal browser application built with React Native that runs on **mobile (Android/iOS)** and **desktop (Windows/macOS/Linux)** platforms.

## Cross-Platform Architecture

This project uses React Native to provide a truly cross-platform experience:
- **Mobile**: React Native (Android/iOS)
- **Desktop**: Electron

## Platform Support

✅ **Android** - Native React Native app  
✅ **iOS** - Native React Native app  
✅ **Windows** - Electron desktop app  
✅ **macOS** - Electron desktop app  
✅ **Linux** - Electron desktop app

## Prerequisites

### For React Native Development

1. **Node.js** (version 14 or newer)
2. **React Native CLI**
   ```bash
   npm install -g @react-native-community/cli
   ```

### For Android Development

1. **Java Development Kit (JDK)** - version 11 or newer
2. **Android Studio** with Android SDK
3. **Android SDK** - API level 31 or newer
4. **Android Virtual Device (AVD)** or physical Android device

### For iOS Development (macOS only)

1. **Xcode** - version 12 or newer
2. **CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/prashmaybe/khoj.git
   cd khoj
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **For iOS only** - Install CocoaPods dependencies
   ```bash
   cd ios && pod install && cd ..
   ```

## Running the Application

### Mobile Development

#### Start Metro Bundler
```bash
npm start
```

#### Run on Android
```bash
npm run android
```

#### Run on iOS (macOS only)
```bash
npm run ios
```

### Desktop Development

#### Run as Electron App (Windows/macOS/Linux)
```bash
npm run desktop
# or
npm run electron-dev
```

### Building for Production

#### Quick Build Commands

#### Build Everything
```bash
npm run build              # Build all platforms
npm run build-all          # Build all platforms (alias)
```

#### Platform-Specific Builds
```bash
# Desktop Applications
npm run build-desktop      # All desktop platforms
npm run build-windows      # Windows executable
npm run build-macos        # macOS application
npm run build-linux        # Linux application

# Mobile Applications
npm run build-mobile       # All mobile platforms
npm run build-android      # Android APK
npm run build-ios          # iOS application (macOS only)
```

#### Advanced Build Options

#### Electron Forge (Recommended Official Method)
```bash
# Install Forge (first time only)
npm install --save-dev @electron-forge/cli
npx electron-forge import

# Create distributables
npm run make               # Creates installers in out/make/
npm run package            # Packages app without installer
```

#### Electron Builder (Advanced Installers)
```bash
# Single platform builds
npm run build-windows      # Windows NSIS installer + portable
npm run build-macos        # macOS DMG + ZIP
npm run build-linux        # Linux AppImage + DEB + RPM

# All desktop platforms
npm run dist-all           # Build all desktop platforms
npm run dist               # Build current platform only
```

#### electron-packager (Simple Executables)
```bash
# Install globally
npm install -g electron-packager

# Package for specific platform
electron-packager . khoj --platform=win32 --arch=x64
electron-packager . khoj --platform=darwin --arch=x64
electron-packager . khoj --platform=linux --arch=x64
```

### Build Outputs

#### Windows
- **Location**: `dist/win/`
- **Files**: 
  - `Khoj Setup x.x.x.exe` (NSIS installer)
  - `khoj-win32-x64/` (Portable version)
- **Architecture**: x64, ia32

#### macOS
- **Location**: `dist/mac/`
- **Files**:
  - `Khoj-x.x.x.dmg` (DMG installer)
  - `khoj-mac-x64.zip` (ZIP archive)
- **Architecture**: x64, arm64 (Apple Silicon)

#### Linux
- **Location**: `dist/linux/`
- **Files**:
  - `khoj-x.x.x.AppImage` (Portable AppImage)
  - `khoj_x.x.x_amd64.deb` (Debian/Ubuntu)
  - `khoj-x.x.x.x86_64.rpm` (RedHat/Fedora)
- **Architecture**: x64

#### Android
- **Location**: `android/app/build/outputs/apk/release/`
- **File**: `app-release.apk`
- **Signing**: Use your own keystore for distribution

#### iOS
- **Location**: `ios/build/`
- **File**: `Khoj.xcarchive`
- **Distribution**: Use Xcode for App Store submission

### Automated Build Scripts

#### Complete Build Script (Unix)
```bash
# Make executable
chmod +x build-scripts/build-all.sh

# Run complete build
./build-scripts/build-all.sh
```

#### Complete Build Script (Windows)
```batch
# Run complete build
build-scripts\build-all.bat
```

### CI/CD Pipeline

#### GitHub Actions (Cloud)
- **File**: `.github/workflows/ci.yml`
- **Triggers**: 
  - Push to `main` and `develop` branches
  - Pull requests to `main`
  - Release creation
- **Jobs**: 
  - `test` - Run tests and compile
  - `build-windows` - Build Windows installer
  - `build-macos` - Build macOS packages
  - `build-linux` - Build Linux packages
  - `release` - Publish release assets
- **Node.js Version**: 22.x
- **Artifacts**: Uploaded to GitHub releases
- **Concurrency**: Cancels in-progress runs

#### Local CI/CD Setup (Using act)

**What is act?**
`act` allows you to run GitHub Actions workflows locally on your machine without pushing to GitHub.

**Installation:**

**Windows (using winget):**
```powershell
winget install act
```

**Windows (using scoop):**
```powershell
scoop bucket add extras
scoop install act
```

**macOS/Linux:**
```bash
brew install act
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | bash
```

**Configuration:**
The project includes `.actrc` configuration file for local testing.

**Usage:**

```bash
# List all available workflows
act -l

# Run all workflows locally
act

# Run on specific event
act push                    # Run on push
act pull_request           # Run on PR
act release                # Run on release

# Run specific job
act -j test                # Run test job
act -j build-windows       # Run Windows build
act -j build-macos         # Run macOS build
act -j build-linux         # Run Linux build

# Dry run (shows what would run without executing)
act -n

# Run with specific branch
act -b main

# View logs in real-time
act -v
```

**Local Build Commands (Direct):**

For quick local builds without CI/CD:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build webpack bundle
npm run build:webpack

# Compile Electron main process
npm run build:main

# Build all platforms
npm run dist-all           # All desktop platforms
npm run build-windows      # Windows only
npm run build-macos        # macOS only
npm run build-linux        # Linux only
```

**CI/CD Workflow Details:**

**GitHub Actions Workflow (.github/workflows/ci.yml):**

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  release:
    types: [published]
```

**Jobs:**
1. **test** (Ubuntu)
   - Node.js 22 setup
   - Install dependencies
   - Run unit tests
   - Build webpack bundle
   - Compile Electron main process

2. **build-windows** (Windows)
   - Node.js 22 setup
   - Install dependencies
   - Build Windows installer (NSIS + portable)
   - Upload artifacts

3. **build-macos** (macOS)
   - Node.js 22 setup
   - Install dependencies
   - Build macOS packages (DMG + ZIP)
   - Upload artifacts

4. **build-linux** (Ubuntu)
   - Node.js 22 setup
   - Install dependencies
   - Build Linux packages (AppImage + DEB + RPM)
   - Upload artifacts

5. **release** (Ubuntu)
   - Download all artifacts
   - Upload to GitHub Release

**Node.js Version Requirements:**
- **Minimum**: Node.js 22.x
- **Reason**: Dependencies require Node.js >=22.12.0
- **Electron**: v42.0.0
- **React Native**: v0.85.3

**Build Outputs:**

| Platform | Output Location | Files |
|----------|----------------|-------|
| Windows | `dist/` | `.exe`, `.exe.blockmap`, `latest.yml` |
| macOS | `dist/` | `.dmg`, `.zip` |
| Linux | `dist/` | `.AppImage`, `.deb`, `.rpm` |

**Artifact Naming:**
- Windows: `windows-${{ github.sha }}`
- macOS: `macos-${{ github.sha }}`
- Linux: `linux-${{ github.sha }}`

**Release Publishing:**
- Automatically publishes to GitHub Releases when a tag is pushed
- Requires `GITHUB_TOKEN` (automatically provided by GitHub)

### Build Requirements

#### Windows
- **Node.js** 14+
- **Visual Studio** 2019+ (for native modules)
- **Windows SDK** (for installer creation)
- **PowerShell** (for build scripts)

#### macOS
- **Node.js** 14+
- **Xcode** 12+ (for iOS builds)
- **Xcode Command Line Tools**
- **CocoaPods** (for iOS dependencies)

#### Linux
- **Node.js** 14+
- **Build Essentials** (for native modules)
- **Python 3** (for node-gyp)
- **libgtk-3-dev** (for some native modules)

### Hardware Requirements

#### Android
- **Processor**: ARMv7 or ARM64
- **RAM**: Minimum 1GB RAM (2GB recommended)
- **Storage**: Minimum 50MB free space
- **Display**: Touchscreen display recommended
- **Connectivity**: Internet connection for initial setup and updates

#### iOS
- **Device**: iPhone 5s or newer, iPad Air or newer
- **Processor**: A7 chip or newer
- **RAM**: Minimum 1GB RAM
- **Storage**: Minimum 50MB free space
- **Connectivity**: Internet connection for initial setup and updates

#### Windows Desktop
- **Processor**: Intel/AMD x86/x64 processor, 1GHz or faster
- **RAM**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 100MB free space
- **Graphics**: DirectX 9 or later with WDDM 1.0 driver
- **Display**: Minimum 800x600 resolution
- **Connectivity**: Internet connection for updates

#### macOS Desktop
- **Processor**: Intel 64-bit or Apple Silicon
- **RAM**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 100MB free space
- **OS**: macOS 10.12 or later
- **Display**: Minimum 800x600 resolution
- **Connectivity**: Internet connection for updates

#### Linux Desktop
- **Processor**: Intel/AMD x86/x64 processor
- **RAM**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 100MB free space
- **Graphics**: OpenGL 2.0+ compatible graphics card
- **Display**: Minimum 800x600 resolution
- **Connectivity**: Internet connection for updates

### Code Signing

#### Windows
```bash
# Configure in package.json build section
"win": {
  "certificateFile": "path/to/certificate.p12",
  "certificatePassword": "password"
}
```

#### macOS
```bash
# Configure in package.json build section
"mac": {
  "identity": "Developer ID Application: Your Name",
  "hardenedRuntime": true,
  "entitlements": "assets/entitlements.mac.plist"
}
```

### Distribution

#### App Stores
- **Windows**: Microsoft Store (requires additional packaging)
- **macOS**: Mac App Store (requires sandboxing)
- **iOS**: App Store (requires Apple Developer account)
- **Android**: Google Play Store (requires signing)

#### Direct Distribution
- **GitHub Releases**: Automated upload on release creation
- **Package Managers**: Submit to Linux repositories

## Project Structure

```
khoj/
├── src/
│   ├── components/
│   │   ├── atoms/          # Basic UI components (Button, Input, etc.)
│   │   ├── molecules/      # Composite components (SearchBar, Tab, etc.)
│   │   ├── organisms/      # Complex components (Browser, TabBar, etc.)
│   │   └── templates/      # Page templates
│   ├── App.tsx             # Universal main application component
│   ├── index.tsx           # React Native mobile entry point
├── android/                # Android-specific code
├── ios/                    # iOS-specific code
├── main.ts                 # Electron main process
├── preload.ts              # Electron preload script
├── index.js                # React Native entry point
├── metro.config.js         # Metro bundler configuration
├── babel.config.js         # Babel configuration
├── react-native.config.js  # Native module configuration
└── package.json            # Dependencies and scripts
```

## Cross-Platform Architecture

### 1. Universal Components
- **Single Codebase**: React Native components work across all platforms
- **Platform Detection**: Use `Platform.OS` for platform-specific behavior
- **Styling**: React Native StyleSheet works everywhere

### 2. Platform Abstraction
- **Mobile**: Direct React Native rendering
- **Desktop Apps**: Electron wrapper provides native desktop features

### 3. Entry Points
- **index.tsx**: React Native mobile apps (Android/iOS)

### 4. Dependencies
- **Core**: `react`, `react-native`
- **Mobile**: Metro bundler, React Native CLI
- **WebView**: `react-native-webview` for web content

## Features

### MVP-ready (desktop Electron)
- **Tabs & navigation** — back, forward, reload, home, address bar with search/URL detection
- **Bookmarks** — save/remove current page (Ctrl+D), bookmarks bar, bookmarks manager page
- **History & downloads** — local history; real file downloads via Electron session (saved to Downloads folder)
- **Incognito windows** — separate window with incognito theme (`#incognito`)
- **Password manager UI** — stored credentials; autofill suggestions injected into page webviews
- **PDF viewer** — open local PDF files (native file picker on desktop)
- **Clear browsing data** — app storage + Electron session cookies/cache where supported
- **Packaging** — `npm run build:webpack && npm run build:main && npm run dist` produces installers

### Experimental / partial
- **Mobile (Android/iOS)** — React Native shell; web rendering not at desktop parity
- **Image search, lazy-loading manager, tab manager** — UI present; depth varies
- **Security** — HTTPS-only and tracker lists are best-effort; not a full content blocker
- **Find in page / print** — delegated to guest page where the engine allows it

### Platform notes
- **Desktop**: Electron + React Native Web UI + `<webview>` for page content
- **Mobile**: React Native (in development)

### ⌨️ Keyboard Shortcuts
- ✅ **Tab Management** - Ctrl+T (New Tab), Ctrl+W (Close Tab), Ctrl+Tab (Switch Tab)
- ✅ **Navigation** - Alt+Left (Back), Alt+Right (Forward), F5 (Reload), Ctrl+L (Focus Address Bar)
- ✅ **Search** - Ctrl+K (Quick Search), Ctrl+F (Find in Page)
- ✅ **Bookmarks** - Ctrl+D (Bookmark Page), Ctrl+B (Toggle Bookmarks Bar)
- ✅ **Windows** - Ctrl+N (New Window), Ctrl+Shift+N (Incognito Window)
- ✅ **Tools** - F12 (Developer Tools), Ctrl+Shift+Delete (Clear Data)
- ✅ **Help** - F1 (Keyboard Shortcuts Help)

## Development Notes

### Platform Detection
Use React Native's Platform API for platform-specific behavior:
```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'android') {
  // Android-specific code
} else if (Platform.OS === 'ios') {
  // iOS-specific code
} else if (Platform.OS === 'windows' || Platform.OS === 'macos') {
  // Desktop-specific code
}
```

### WebView Integration
- **Mobile**: Uses `react-native-webview` for native web content

### Styling Strategy
- **Universal**: React Native StyleSheet works across all platforms
- **Platform-Specific**: Apply conditional styles based on `Platform.OS`
- **Responsive**: Use flexbox and percentage-based layouts

### Development Workflow
1. **Universal Components**: Build once, run everywhere
2. **Platform Testing**: Test on target platforms during development
3. **Conditional Features**: Add platform-specific enhancements where needed

## Building for Production

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
```bash
# Open ios/Khoj.xcworkspace in Xcode
# Archive and distribute through App Store Connect
```

## Troubleshooting

### Common Issues

1. **Metro bundler not starting**
   - Clear cache: `npm start -- --reset-cache`

2. **Android build fails**
   - Check Android SDK installation
   - Clean build: `cd android && ./gradlew clean`

3. **iOS build fails**
   - Update CocoaPods: `cd ios && pod update`
   - Clean Xcode build folder

4. **Module not found errors**
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Clear Metro cache

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both platforms if possible
5. Submit a pull request

## License

ISC License - see LICENSE file for details.
