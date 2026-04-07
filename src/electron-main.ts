import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import { autoUpdater } from 'electron-updater';

class KhojBrowser {
    private mainWindow: BrowserWindow | null = null;
    private isDevelopment: boolean = process.env.NODE_ENV === 'development';

    constructor() {
        this.initializeApp();
    }

    private initializeApp(): void {
        // Configure auto updater
        this.configureAutoUpdater();
        
        // Set app user model ID for Windows
        if (process.platform === 'win32') {
            app.setAppUserModelId('com.khoj.browser');
        }

        // Handle app ready
        app.whenReady().then(() => {
            this.createMainWindow();
            this.setupMenu();
            this.setupEventHandlers();
            this.setupAutoUpdaterEvents();
        });

        // Handle window all closed
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        // Handle app activate (macOS)
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createMainWindow();
            }
        });

        // Handle security
        app.on('web-contents-created', (_, contents) => {
            contents.setWindowOpenHandler(({ url }) => {
                shell.openExternal(url);
                return { action: 'deny' };
            });
        });
    }

    private createMainWindow(): void {
        // Create the browser window
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            minWidth: 800,
            minHeight: 600,
            show: false,
            frame: false,
            titleBarStyle: 'hiddenInset',
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
                webSecurity: true,
                allowRunningInsecureContent: false,
                experimentalFeatures: false
            },
            icon: this.getAppIcon()
        });

        // Load the app
        const indexPath = path.join(__dirname, 'electron-index.html');
        this.mainWindow.loadFile(indexPath);

        // Show window when ready
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow?.show();
            
            if (this.isDevelopment) {
                this.mainWindow?.webContents.openDevTools();
            }
        });

        // Handle window closed
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        // Handle window state
        this.mainWindow.on('maximize', () => {
            this.mainWindow?.webContents.send('window-maximized');
        });

        this.mainWindow.on('unmaximize', () => {
            this.mainWindow?.webContents.send('window-unmaximized');
        });

        this.mainWindow.on('focus', () => {
            this.mainWindow?.webContents.send('window-focused');
        });

        // Handle new window requests - intercept them and open in new tab instead
        this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            // Send message to renderer to open URL in new tab
            this.mainWindow?.webContents.send('open-url-in-new-tab', url);
            return { action: 'deny' }; // Prevent opening in external browser
        });

        this.mainWindow.on('blur', () => {
            this.mainWindow?.webContents.send('window-blurred');
        });
    }

    private configureAutoUpdater(): void {
        // Configure auto updater settings
        autoUpdater.checkForUpdatesAndNotify();
        autoUpdater.setFeedURL({
            provider: 'github',
            owner: 'yourusername',
            repo: 'khoj-browser'
        });
    }

    private setupAutoUpdaterEvents(): void {
        // Check for updates when app starts
        if (!this.isDevelopment) {
            autoUpdater.checkForUpdatesAndNotify();
        }

        // Auto updater events
        autoUpdater.on('checking-for-update', () => {
            console.log('Checking for update...');
            this.mainWindow?.webContents.send('auto-updater', { type: 'checking' });
        });

        autoUpdater.on('update-available', (info) => {
            console.log('Update available:', info);
            this.mainWindow?.webContents.send('auto-updater', { 
                type: 'available', 
                version: info.version,
                releaseNotes: info.releaseNotes
            });
        });

        autoUpdater.on('update-not-available', (info) => {
            console.log('Update not available:', info);
            this.mainWindow?.webContents.send('auto-updater', { type: 'not-available' });
        });

        autoUpdater.on('error', (err) => {
            console.error('Auto updater error:', err);
            this.mainWindow?.webContents.send('auto-updater', { type: 'error', error: err.message });
        });

        autoUpdater.on('download-progress', (progressObj) => {
            const { percent, transferred, total } = progressObj;
            console.log(`Download progress: ${percent}%`);
            this.mainWindow?.webContents.send('auto-updater', { 
                type: 'progress',
                percent: Math.round(percent),
                transferred: Math.round(transferred / 1024 / 1024),
                total: Math.round(total / 1024 / 1024)
            });
        });

        autoUpdater.on('update-downloaded', (info) => {
            console.log('Update downloaded:', info);
            this.mainWindow?.webContents.send('auto-updater', { 
                type: 'downloaded',
                version: info.version
            });
            
            // Show dialog to restart app
            dialog.showMessageBox(this.mainWindow!, {
                type: 'info',
                title: 'Update Ready',
                message: 'A new version of Khoj is ready to install.',
                detail: 'The application will restart to complete the update.',
                buttons: ['Restart Now', 'Later']
            }).then((result) => {
                if (result.response === 0) {
                    autoUpdater.quitAndInstall();
                }
            });
        });
    }

    private setupMenu(): void {
        const template: Electron.MenuItemConstructorOptions[] = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'New Window',
                        accelerator: 'CmdOrCtrl+N',
                        click: () => this.createNewWindow()
                    },
                    {
                        label: 'New Tab',
                        accelerator: 'CmdOrCtrl+T',
                        click: () => {
                            this.mainWindow?.webContents.send('new-tab');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Close Window',
                        accelerator: process.platform === 'darwin' ? 'Cmd+W' : 'Ctrl+W',
                        click: () => {
                            this.mainWindow?.close();
                        }
                    },
                    {
                        label: 'Close Tab',
                        accelerator: 'CmdOrCtrl+Shift+W',
                        click: () => {
                            this.mainWindow?.webContents.send('close-tab');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Print',
                        accelerator: 'CmdOrCtrl+P',
                        click: () => {
                            this.mainWindow?.webContents.send('print-page');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Quit',
                        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                        click: () => {
                            app.quit();
                        }
                    }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo', label: 'Undo' },
                    { role: 'redo', label: 'Redo' },
                    { type: 'separator' },
                    { role: 'cut', label: 'Cut' },
                    { role: 'copy', label: 'Copy' },
                    { role: 'paste', label: 'Paste' },
                    { role: 'selectAll', label: 'Select All' },
                    { type: 'separator' },
                    {
                        label: 'Find',
                        accelerator: 'CmdOrCtrl+F',
                        click: () => {
                            this.mainWindow?.webContents.send('find');
                        }
                    },
                    {
                        label: 'Find Next',
                        accelerator: 'CmdOrCtrl+G',
                        click: () => {
                            this.mainWindow?.webContents.send('find-next');
                        }
                    },
                    {
                        label: 'Find Previous',
                        accelerator: 'CmdOrCtrl+Shift+G',
                        click: () => {
                            this.mainWindow?.webContents.send('find-previous');
                        }
                    }
                ]
            },
            {
                label: 'View',
                submenu: [
                    {
                        label: 'Reload',
                        accelerator: 'CmdOrCtrl+R',
                        click: () => {
                            this.mainWindow?.webContents.send('reload');
                        }
                    },
                    {
                        label: 'Force Reload',
                        accelerator: 'CmdOrCtrl+Shift+R',
                        click: () => {
                            this.mainWindow?.webContents.send('force-reload');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Actual Size',
                        accelerator: 'CmdOrCtrl+0',
                        click: () => {
                            this.mainWindow?.webContents.send('zoom-reset');
                        }
                    },
                    {
                        label: 'Zoom In',
                        accelerator: 'CmdOrCtrl+Plus',
                        click: () => {
                            this.mainWindow?.webContents.send('zoom-in');
                        }
                    },
                    {
                        label: 'Zoom Out',
                        accelerator: 'CmdOrCtrl+-',
                        click: () => {
                            this.mainWindow?.webContents.send('zoom-out');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Developer Tools',
                        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
                        click: () => {
                            this.mainWindow?.webContents.send('toggle-dev-tools');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Full Screen',
                        accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
                        click: () => {
                            this.mainWindow?.setFullScreen(!this.mainWindow?.isFullScreen());
                        }
                    }
                ]
            },
            {
                label: 'History',
                submenu: [
                    {
                        label: 'Back',
                        accelerator: process.platform === 'darwin' ? 'Cmd+[' : 'Alt+Left',
                        click: () => {
                            this.mainWindow?.webContents.send('go-back');
                        }
                    },
                    {
                        label: 'Forward',
                        accelerator: process.platform === 'darwin' ? 'Cmd+]' : 'Alt+Right',
                        click: () => {
                            this.mainWindow?.webContents.send('go-forward');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Show Full History',
                        accelerator: 'CmdOrCtrl+H',
                        click: () => {
                            this.mainWindow?.webContents.send('show-history');
                        }
                    },
                    {
                        label: 'Show Downloads',
                        accelerator: 'CmdOrCtrl+J',
                        click: () => {
                            this.mainWindow?.webContents.send('show-downloads');
                        }
                    }
                ]
            },
            {
                label: 'Bookmarks',
                submenu: [
                    {
                        label: 'Bookmark This Page',
                        accelerator: 'CmdOrCtrl+D',
                        click: () => {
                            this.mainWindow?.webContents.send('bookmark-page');
                        }
                    },
                    {
                        label: 'Show All Bookmarks',
                        accelerator: 'CmdOrCtrl+Shift+B',
                        click: () => {
                            this.mainWindow?.webContents.send('show-bookmarks');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Import Bookmarks and Settings',
                        click: () => {
                            this.showImportDialog();
                        }
                    },
                    {
                        label: 'Export Bookmarks',
                        click: () => {
                            this.showExportDialog();
                        }
                    }
                ]
            },
            {
                label: 'Window',
                submenu: [
                    {
                        label: 'Minimize',
                        accelerator: 'CmdOrCtrl+M',
                        click: () => {
                            this.mainWindow?.minimize();
                        }
                    },
                    {
                        label: 'Maximize',
                        click: () => {
                            this.mainWindow?.maximize();
                        }
                    },
                    {
                        label: 'Unmaximize',
                        click: () => {
                            this.mainWindow?.unmaximize();
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'New Window',
                        accelerator: 'CmdOrCtrl+N',
                        click: () => this.createNewWindow()
                    },
                    {
                        label: 'New Incognito Window',
                        accelerator: 'CmdOrCtrl+Shift+N',
                        click: () => this.createNewIncognitoWindow()
                    }
                ]
            },
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'About',
                        click: () => {
                            this.showAboutDialog();
                        }
                    },
                    {
                        label: 'Help Center',
                        click: () => {
                            shell.openExternal('https://github.com/yourusername/khoj-browser');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Report an Issue',
                        click: () => {
                            shell.openExternal('https://github.com/yourusername/khoj-browser/issues');
                        }
                    }
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    private setupEventHandlers(): void {
        // Window control handlers
        ipcMain.handle('window-minimize', () => {
            this.mainWindow?.minimize();
        });

        ipcMain.handle('window-maximize', () => {
            if (this.mainWindow?.isMaximized()) {
                this.mainWindow.unmaximize();
            } else {
                this.mainWindow?.maximize();
            }
        });

        ipcMain.handle('window-close', () => {
            this.mainWindow?.close();
        });

        // URL handlers
        ipcMain.handle('open-external', (_, url: string) => {
            shell.openExternal(url);
        });

        // File handlers
        ipcMain.handle('show-save-dialog', async (_, options) => {
            return await dialog.showSaveDialog(this.mainWindow!, options);
        });

        ipcMain.handle('show-open-dialog', async (_, options) => {
            return await dialog.showOpenDialog(this.mainWindow!, options);
        });
    }

    private createNewWindow(): void {
        const newWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            minWidth: 800,
            minHeight: 600,
            frame: false,
            titleBarStyle: 'hiddenInset',
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            },
            icon: this.getAppIcon()
        });

        const indexPath = path.join(__dirname, 'electron-index.html');
        newWindow.loadFile(indexPath);
    }

    private createNewIncognitoWindow(): void {
        const incognitoWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            minWidth: 800,
            minHeight: 600,
            frame: false,
            titleBarStyle: 'hiddenInset',
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
                partition: 'incognito'
            },
            icon: this.getAppIcon()
        });

        const indexPath = path.join(__dirname, 'electron-index.html');
        incognitoWindow.loadFile(indexPath);
    }

    private showAboutDialog(): void {
        dialog.showMessageBox(this.mainWindow!, {
            type: 'info',
            title: 'About Khoj',
            message: 'Khoj Browser',
            detail: 'Version 1.0.0\n\nA modern web browser built with Electron and TypeScript.\n\n© 2024 Khoj',
            buttons: ['OK']
        });
    }

    private showImportDialog(): void {
        dialog.showOpenDialog(this.mainWindow!, {
            title: 'Import Bookmarks',
            filters: [
                { name: 'HTML Files', extensions: ['html', 'htm'] },
                { name: 'JSON Files', extensions: ['json'] }
            ],
            properties: ['openFile']
        }).then(result => {
            if (!result.canceled && result.filePaths.length > 0) {
                this.mainWindow?.webContents.send('import-bookmarks', result.filePaths[0]);
            }
        });
    }

    private showExportDialog(): void {
        dialog.showSaveDialog(this.mainWindow!, {
            title: 'Export Bookmarks',
            defaultPath: 'bookmarks.html',
            filters: [
                { name: 'HTML Files', extensions: ['html'] },
                { name: 'JSON Files', extensions: ['json'] }
            ]
        }).then(result => {
            if (!result.canceled && result.filePath) {
                this.mainWindow?.webContents.send('export-bookmarks', result.filePath);
            }
        });
    }

    private getAppIcon(): string {
        if (process.platform === 'win32') {
            return path.join(__dirname, '../assets/icon.ico');
        } else if (process.platform === 'darwin') {
            return path.join(__dirname, '../assets/icon.icns');
        } else {
            return path.join(__dirname, '../assets/icon.png');
        }
    }
}

// Initialize the application
new KhojBrowser();
