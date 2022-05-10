const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  output: {
    path: `${__dirname}/../../origo/plugins`,
    publicPath: '/build/js',
    filename: 'castor.js',
    libraryTarget: 'var',
    libraryExport: 'default',
    library: 'Castor'
  },
  mode: 'development',
  devtool: 'source-map',
  module: {},
  devServer: {
    static: "./",
    port: 9009,
  }
});
