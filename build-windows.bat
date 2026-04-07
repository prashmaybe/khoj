@echo off
echo Building Chrome-Like Browser for Windows...

echo Step 1: Building TypeScript files...
call npm run build-electron

echo Step 2: Creating release directory...
if not exist release mkdir release
if not exist release\Chrome-Like-Browser mkdir release\Chrome-Like-Browser

echo Step 3: Copying application files...
xcopy dist release\Chrome-Like-Browser\dist /E /I /Y
xcopy node_modules release\Chrome-Like-Browser\node_modules /E /I /Y
copy package.json release\Chrome-Like-Browser\

echo Step 4: Creating launcher script...
echo @echo off > release\Chrome-Like-Browser\start.bat
echo cd /d "%%~dp0" >> release\Chrome-Like-Browser\start.bat
echo npx electron dist\electron-main.js >> release\Chrome-Like-Browser\start.bat

echo Step 5: Creating README...
echo Chrome-Like Browser > release\Chrome-Like-Browser\README.txt
echo =================== >> release\Chrome-Like-Browser\README.txt
echo. >> release\Chrome-Like-Browser\README.txt
echo A modern web browser built with Electron and TypeScript. >> release\Chrome-Like-Browser\README.txt
echo. >> release\Chrome-Like-Browser\README.txt
echo To run the browser: >> release\Chrome-Like-Browser\README.txt
echo 1. Double-click start.bat >> release\Chrome-Like-Browser\README.txt
echo 2. Or run: npx electron dist\electron-main.js >> release\Chrome-Like-Browser\README.txt
echo. >> release\Chrome-Like-Browser\README.txt
echo Features: >> release\Chrome-Like-Browser\README.txt
echo - Multi-tab browsing >> release\Chrome-Like-Browser\README.txt
echo - Chrome-like interface >> release\Chrome-Like-Browser\README.txt
echo - Developer tools >> release\Chrome-Like-Browser\README.txt
echo - Downloads manager >> release\Chrome-Like-Browser\README.txt
echo - Bookmarks and history >> release\Chrome-Like-Browser\README.txt
echo - Keyboard shortcuts >> release\Chrome-Like-Browser\README.txt

echo Build completed successfully!
echo Application is ready in: release\Chrome-Like-Browser\
echo.
echo To run the application:
echo 1. Navigate to release\Chrome-Like-Browser
echo 2. Run start.bat
pause
