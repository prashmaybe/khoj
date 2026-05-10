module.exports = {
  packagerConfig: {
    name: 'Khoj',
    executableName: 'khoj',
    icon: 'assets/khoj_platform_assets/windows/khoj',
    extraResource: [
      'assets'
    ],
    asar: true,
    ignore: [
      /src/,
      /\.git/,
      /node_modules\/\.bin/,
      /out/,
      /dist/
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'khoj',
        authors: 'Prashant Kapoor',
        description: 'Cross-platform browser application',
        iconUrl: 'https://raw.githubusercontent.com/prashmaybe/khoj/main/assets/khoj_platform_assets/windows/khoj.ico'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Prashant Kapoor',
          homepage: 'https://github.com/prashmaybe/khoj'
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          maintainer: 'Prashant Kapoor',
          homepage: 'https://github.com/prashmaybe/khoj'
        }
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    },
    {
      name: '@electron-forge/plugin-fuses',
      config: {
        version: FusesPlugin.FUSES_VERSION_1,
        [FusesPlugin.FUSES.runAsNode]: false,
        [FusesPlugin.FUSES.enableCookieEncryption]: true,
        [FusesPlugin.FUSES.enableNodeOptionsEnvironmentVariable]: false,
        [FusesPlugin.FUSES.enableNodeCliInspectArguments]: false,
        [FusesPlugin.FUSES.enableEmbeddedAsarIntegrityValidation]: true,
        [FusesPlugin.FUSES.onlyLoadAppFromAsar]: true,
      }
    }
  ]
};
