/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "electron"
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
(module) {

module.exports = require("electron");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!********************!*\
  !*** ./preload.ts ***!
  \********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);

console.log('Preload script is loading...');
electron__WEBPACK_IMPORTED_MODULE_0__.contextBridge.exposeInMainWorld('electronAPI', {
    createTab: (tabId, url) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('create-tab', tabId, url),
    navigateTab: (tabId, url) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('navigate-tab', tabId, url),
    switchTab: (tabId) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('switch-tab', tabId),
    closeTab: (tabId) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('close-tab', tabId),
    goBack: (tabId) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('go-back', tabId),
    goForward: (tabId) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('go-forward', tabId),
    reload: (tabId) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('reload', tabId),
    onTabLoading: (callback) => {
        electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('tab-loading', (_, tabId) => callback(tabId));
    },
    onTabLoaded: (callback) => {
        electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('tab-loaded', (_, tabId, url) => callback(tabId, url));
    },
    onTabFailed: (callback) => {
        electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('tab-failed', (_, tabId, errorCode, errorDescription) => callback(tabId, errorCode, errorDescription));
    },
    removeAllListeners: (channel) => {
        electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.removeAllListeners(channel);
    }
});

})();

/******/ })()
;
//# sourceMappingURL=preload.js.map