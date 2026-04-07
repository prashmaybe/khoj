@echo off
echo Building Khoj Browser for Windows...

echo Step 1: Building TypeScript files...
call npm run build-electron

echo Step 2: Creating release directory...
if not exist release mkdir release
if not exist release\Khoj-Browser mkdir release\Khoj-Browser

echo Step 3: Copying application files...
xcopy dist release\Khoj-Browser\dist /E /I /Y
xcopy node_modules release\Khoj-Browser\node_modules /E /I /Y
copy package.json release\Khoj-Browser\

echo Step 4: Creating launcher script...
echo @echo off > release\Khoj-Browser\start.bat
echo cd /d "%%~dp0" >> release\Khoj-Browser\start.bat
echo npx electron dist\electron-main.js >> release\Khoj-Browser\start.bat

echo Step 5: Creating README...
echo Khoj Browser > release\Khoj-Browser\README.txt
echo ============= >> release\Khoj-Browser\README.txt
echo. >> release\Khoj-Browser\README.txt
echo A modern web browser built with Electron and TypeScript. >> release\Khoj-Browser\README.txt
echo. >> release\Khoj-Browser\README.txt
echo To run the browser: >> release\Khoj-Browser\README.txt
echo 1. Double-click start.bat >> release\Khoj-Browser\README.txt
echo 2. Or run: npx electron dist\electron-main.js >> release\Khoj-Browser\README.txt
echo. >> release\Khoj-Browser\README.txt
echo Features: >> release\Khoj-Browser\README.txt
echo - Multi-tab browsing >> release\Khoj-Browser\README.txt
echo - Modern interface >> release\Khoj-Browser\README.txt
echo - Developer tools >> release\Khoj-Browser\README.txt
echo - Downloads manager >> release\Khoj-Browser\README.txt
echo - Bookmarks and history >> release\Khoj-Browser\README.txt
echo - Keyboard shortcuts >> release\Khoj-Browser\README.txt

echo Build completed successfully!
echo Application is ready in: release\Khoj-Browser\
echo.
echo To run the application:
echo 1. Navigate to release\Khoj-Browser
echo 2. Run start.bat
pause
