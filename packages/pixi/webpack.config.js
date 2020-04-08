const { resolve, join } = require('path');
const pkg = require('./package.json');

module.exports = {
  mode: "development",
  entry: resolve(__dirname, 'src/main.ts'),
  output: {
    path: resolve(__dirname, 'lib'),
    filename: 'main.js',
    libraryTarget: "umd",
    library: pkg.libName || 'newLib',
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.json', '.ts', '.js']
  },
  module: {
    rules: [
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.ts$/, loader: 'ts-loader', exclude: /node_modules/ },
    ]
  }
};