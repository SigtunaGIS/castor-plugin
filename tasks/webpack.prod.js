const webpack = require('webpack');
const { merge } = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  optimization: {
    nodeEnv: 'production',
    minimize: true
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
    new UglifyJSPlugin({
      uglifyOptions: {
        output: {
          beautify: false
        }
      }
    }),
    new webpack.optimize.AggressiveMergingPlugin()
  ]
});
