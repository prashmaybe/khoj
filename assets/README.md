# Application Assets

This folder contains icons and other assets needed for building the cross-platform Khoj Browser application.

## Required Icons

### Windows (.ico)
- **File**: `icon.ico`
- **Size**: 256x256 pixels (multiple sizes embedded)
- **Format**: Windows ICO format
- **Usage**: Windows executable and installer

### macOS (.icns)
- **File**: `icon.icns`
- **Size**: Multiple sizes (16x16 to 1024x1024)
- **Format**: macOS ICNS format
- **Usage**: macOS application bundle

### Linux (.png)
- **File**: `icon.png`
- **Size**: 512x512 pixels
- **Format**: PNG with transparency
- **Usage**: Linux desktop applications

### Android
- **Files**: Various sizes in `android/app/src/main/res/mipmap-*`
- **Sizes**: 36x36, 48x48, 72x72, 96x96, 144x144, 192x192
- **Format**: PNG
- **Usage**: Android app icons

### iOS
- **Files**: Various sizes in `ios/Khoj/Images.xcassets/AppIcon.appiconset/`
- **Sizes**: Multiple sizes for iPhone and iPad
- **Format**: PNG
- **Usage**: iOS app icons

## Generating Icons

### Using an Online Tool
1. Upload a high-resolution PNG (1024x1024 or larger)
2. Use services like:
   - https://favicon.io/
   - https://www.iconsgenerator.com/
   - https://convertico.com/

### Using Command Line Tools
```bash
# Install ImageMagick
brew install imagemagick  # macOS
sudo apt-get install imagemagick  # Linux

# Convert PNG to ICO
convert icon.png -resize 256x256 -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# Convert PNG to ICNS (requires macOS)
iconutil -c icns icon.iconset

# Resize for Linux
convert icon.png -resize 512x512 icon.png
```

## Asset Requirements

### Electron Builder
- Icons specified in `package.json` build configuration
- Must be in the correct format for each platform

### React Native
- Mobile icons placed in platform-specific folders
- Follow React Native naming conventions

### Web
- Favicon for web browsers
- PWA icons if needed

## Notes

- Ensure icons have transparent backgrounds where appropriate
- Test icons on different backgrounds for visibility
- Follow platform design guidelines for best results
- Keep icon designs simple and recognizable at small sizes
