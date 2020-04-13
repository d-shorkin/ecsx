const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/main.ts',
  devtool: "cheap-source-map",
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/'}
    ]
  },
  devServer: {
    contentBase: path.resolve(__dirname, './'),
    publicPath: '/build/',
    host: '0.0.0.0',
    port: 8090,
    open: false
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new webpack.ProvidePlugin({
      PIXI: 'pixi.js',
      Matter: 'matter-js',
      'window.decomp': 'poly-decomp'
    }),
  ],
};
