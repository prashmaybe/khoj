"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    createWindow: () => electron_1.ipcRenderer.invoke('create-window'),
    createIncognitoWindow: () => electron_1.ipcRenderer.invoke('create-incognito-window'),
    closeWindow: () => electron_1.ipcRenderer.invoke('close-window'),
    openPdfFile: () => electron_1.ipcRenderer.invoke('open-pdf-file'),
    clearBrowsingData: (options) => electron_1.ipcRenderer.invoke('clear-browsing-data', options),
    onDownloadStarted: (callback) => {
        electron_1.ipcRenderer.on('download-started', (_event, data) => callback(data));
    },
    onDownloadProgress: (callback) => {
        electron_1.ipcRenderer.on('download-progress', (_event, data) => callback(data));
    },
    onDownloadCompleted: (callback) => {
        electron_1.ipcRenderer.on('download-completed', (_event, data) => callback(data));
    },
    onDownloadFailed: (callback) => {
        electron_1.ipcRenderer.on('download-failed', (_event, data) => callback(data));
    },
    removeAllListeners: (channel) => {
        electron_1.ipcRenderer.removeAllListeners(channel);
    },
});
