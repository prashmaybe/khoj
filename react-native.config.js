module.exports = {
  dependencies: {
    'react-native-webview': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-webview/android',
          packageImportPath: 'react-native-webview',
        },
        ios: {
          podspecPath: '../node_modules/react-native-webview/react-native-webview.podspec',
        },
      },
    },
  },
};
