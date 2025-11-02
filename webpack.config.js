const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    main: './script.js',
    modal: './modal-component.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.WORKER_API_KEY': JSON.stringify(process.env.WORKER_API_KEY || ''),
    }),
    new CopyPlugin({
      patterns: [
        { from: 'index.html', to: 'index.html' },
        { from: 'style.css', to: 'style.css' },
        { from: 'geojson.json', to: 'geojson.json' },
      ],
    }),
  ],
  mode: 'production',
};