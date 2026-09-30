const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: [
    './castor.js'
  ],
  module: {
    rules: [{
      test: /\.(js)$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        cacheDirectory: false,
        targets: {
          browsers: ['chrome >= 39']
        },
        presets: [
          ['@babel/preset-env', {
            modules: false
          }]
        ],
        plugins: [
          ['babel-plugin-polyfill-corejs3', {
            method: 'usage-global',
            version: '3.50'
          }]
        ]
      }
    }]
  },
  externals: ['Origo'],
  resolve: {
    extensions: ['*', '.js', '.scss']
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'static', to: './' }
      ]
    })
  ]
};
