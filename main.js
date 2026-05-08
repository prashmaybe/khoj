"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = require("fs");
let mainWindow = null;
let browserViews = new Map();
let activeViewId = null;
function updateActiveViewBounds() {
    if (!mainWindow || !activeViewId)
        return;
    const view = browserViews.get(activeViewId);
    if (!view)
        return;
    const { width, height } = mainWindow.getContentBounds();
    const topBarHeight = 100;
    view.setBounds({
        x: 0,
        y: topBarHeight,
        width,
        height: Math.max(0, height - topBarHeight),
    });
}
function createWindow() {
    const preloadPath = path.join(__dirname, "preload.js");
    console.log("Preload script path:", preloadPath);
    console.log("Preload script exists:", fs.existsSync(preloadPath));
    mainWindow = new electron_1.BrowserWindow({
        height: 800,
        width: 1200,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            preload: preloadPath,
        },
    });
    const isDev = process.env.NODE_ENV === "development" || !electron_1.app.isPackaged;
    if (isDev) {
        mainWindow.loadURL("http://localhost:8080");
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, "dist/index.html"));
    }
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
    mainWindow.on("resize", () => {
        updateActiveViewBounds();
    });
}
function setupIpcHandlers() {
    electron_1.ipcMain.handle("create-tab", async (_, tabId, url) => {
        if (!mainWindow)
            return null;
        const view = new electron_1.BrowserView({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: true,
            },
        });
        browserViews.set(tabId, view);
        view.webContents.on("did-start-loading", () => {
            var _a;
            (_a = mainWindow) === null || _a === void 0 ? void 0 : _a.webContents.send("tab-loading", tabId);
        });
        view.webContents.on("did-finish-load", () => {
            var _a;
            (_a = mainWindow) === null || _a === void 0 ? void 0 : _a.webContents.send("tab-loaded", tabId, view.webContents.getURL());
        });
        view.webContents.on("did-fail-load", (_, errorCode, errorDescription) => {
            var _a;
            (_a = mainWindow) === null || _a === void 0 ? void 0 : _a.webContents.send("tab-failed", tabId, errorCode, errorDescription);
        });
        await view.webContents.loadURL(url);
        if (!activeViewId) {
            activeViewId = tabId;
            mainWindow.addBrowserView(view);
            updateActiveViewBounds();
        }
        return tabId;
    });
    electron_1.ipcMain.handle("navigate-tab", async (_, tabId, url) => {
        const view = browserViews.get(tabId);
        if (view) {
            await view.webContents.loadURL(url);
        }
    });
    electron_1.ipcMain.handle("switch-tab", (_, tabId) => {
        if (!mainWindow)
            return;
        const currentView = activeViewId ? browserViews.get(activeViewId) : undefined;
        if (currentView) {
            mainWindow.removeBrowserView(currentView);
        }
        const newView = browserViews.get(tabId);
        if (newView) {
            activeViewId = tabId;
            mainWindow.addBrowserView(newView);
            updateActiveViewBounds();
        }
    });
    electron_1.ipcMain.handle("close-tab", (_, tabId) => {
        const view = browserViews.get(tabId);
        if (!view)
            return;
        view.webContents.close();
        browserViews.delete(tabId);
        if (!mainWindow)
            return;
        if (activeViewId === tabId) {
            activeViewId = null;
            const remainingTabs = Array.from(browserViews.keys());
            if (remainingTabs.length > 0) {
                const newActiveTab = remainingTabs[0];
                const newView = browserViews.get(newActiveTab);
                if (newView) {
                    activeViewId = newActiveTab;
                    mainWindow.addBrowserView(newView);
                    updateActiveViewBounds();
                }
            }
        }
    });
    electron_1.ipcMain.handle("go-back", (_, tabId) => {
        const view = browserViews.get(tabId);
        if (view && view.webContents.canGoBack()) {
            view.webContents.goBack();
        }
    });
    electron_1.ipcMain.handle("go-forward", (_, tabId) => {
        const view = browserViews.get(tabId);
        if (view && view.webContents.canGoForward()) {
            view.webContents.goForward();
        }
    });
    electron_1.ipcMain.handle("reload", (_, tabId) => {
        const view = browserViews.get(tabId);
        if (view) {
            view.webContents.reload();
        }
    });
}
electron_1.app.whenReady().then(() => {
    createWindow();
    setupIpcHandlers();
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
