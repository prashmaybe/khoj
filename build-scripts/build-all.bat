@echo off
REM Khoj Browser - Complete Build Script for Windows
REM This script builds the application for all platforms

echo 🚀 Starting complete build process for Khoj Browser...

REM Clean previous builds
echo 🧹 Cleaning previous builds...
npm run clean

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Build web version
echo 🌐 Building web version...
npm run build-web

REM Build desktop applications
echo 🖥️  Building desktop applications...

REM Windows
echo 📦 Building Windows executable...
npm run build-windows

REM macOS (cross-compilation - limited)
echo 📦 Building macOS application (cross-compilation)...
npm run build-macos

REM Linux (cross-compilation)
echo 📦 Building Linux application (cross-compilation)...
npm run build-linux

REM Build mobile applications
echo 📱 Building mobile applications...

REM Android
echo 📦 Building Android APK...
npm run build-android

REM iOS (not available on Windows)
echo ⚠️  iOS build skipped (requires macOS)

echo ✅ Complete build process finished!
echo.
echo 📁 Build outputs:
echo   - Web: dist/
echo   - Windows: dist/win/
echo   - macOS: dist/mac/ (cross-compiled)
echo   - Linux: dist/linux/ (cross-compiled)
echo   - Android: android/app/build/outputs/apk/release/

echo.
echo 📊 Build Summary:
if exist dist\win\*.exe (
    dir /b dist\win\*.exe | find /c /v "" > temp.txt
    set /p count=<temp.txt
    echo Windows executables created: %count%
    del temp.txt
)

if exist android\app\build\outputs\apk\release\*.apk (
    dir /b android\app\build\outputs\apk\release\*.apk | find /c /v "" > temp.txt
    set /p count=<temp.txt
    echo Android APKs created: %count%
    del temp.txt
)

pause
