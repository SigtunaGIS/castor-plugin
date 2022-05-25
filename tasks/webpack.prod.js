const webpack = require('webpack');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  optimization: {
    nodeEnv: 'production',
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })]
  },
  performance: {
    hints: false
  },
  output: {
    path: `${__dirname}/../build/js`,
    filename: 'castor.min.js',
    libraryTarget: 'var',
    libraryExport: 'default',
    library: 'Castor'
  },
  devtool: false,
  mode: 'production',
  module: {},
  plugins: [
    new webpack.optimize.AggressiveMergingPlugin()
  ]
});
