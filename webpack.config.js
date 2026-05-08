const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
  {
    mode: 'development',
    entry: './src/index.tsx',
    name: 'renderer',
    // The renderer runs with `nodeIntegration: false`, so it must be bundled
    // for a browser-like environment (no `require` at runtime).
    target: 'web',
    devtool: 'source-map',
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
      ],
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      // With `nodeIntegration: false`, `global` doesn't exist in the renderer.
      // Ensure webpack runtime uses a browser-safe global.
      globalObject: 'globalThis',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
    ],
    devServer: {
      port: 8080,
      hot: true,
      open: false,
    },
  },
  {
    mode: 'development',
    entry: './preload.ts',
    name: 'preload',
    target: 'electron-preload',
    devtool: 'source-map',
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
          exclude: /node_modules/,
        },
      ],
    },
    output: {
      filename: 'preload.js',
      path: path.resolve(__dirname, '.'),
    },
  },
];
