#!/bin/bash

# Khoj - Complete Build Script
# This script builds the application for all platforms

set -e

echo "🚀 Starting complete build process for Khoj..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build web version
echo "🌐 Building web version..."
npm run build-web

# Build desktop applications
echo "🖥️  Building desktop applications..."

# Windows
echo "📦 Building Windows executable..."
npm run build-windows

# macOS
echo "📦 Building macOS application..."
npm run build-macos

# Linux
echo "📦 Building Linux application..."
npm run build-linux

# Build mobile applications
echo "📱 Building mobile applications..."

# Android
echo "📦 Building Android APK..."
npm run build-android

# iOS (only on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📦 Building iOS application..."
    npm run build-ios
else
    echo "⚠️  iOS build skipped (requires macOS)"
fi

echo "✅ Complete build process finished!"
echo ""
echo "📁 Build outputs:"
echo "  - Web: dist/"
echo "  - Windows: dist/win/"
echo "  - macOS: dist/mac/"
echo "  - Linux: dist/linux/"
echo "  - Android: android/app/build/outputs/apk/release/"
echo "  - iOS: ios/build/"

# Create release summary
echo ""
echo "📊 Build Summary:"
find dist -name "*.exe" -o -name "*.dmg" -o -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" -o -name "*.zip" | wc -l | xargs echo "Desktop packages created:"
find android/app/build/outputs/apk/release -name "*.apk" 2>/dev/null | wc -l | xargs echo "Android APKs created:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    find ios/build -name "*.xcarchive" 2>/dev/null | wc -l | xargs echo "iOS archives created:"
fi
