const webpackConfig = require('./webpack.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const project = require('./aurelia_project/aurelia.json');
var originalConfig = webpackConfig({}, {});

module.exports = () => {
  let config = originalConfig;
  // output files without hashes
  config.output.filename = '[name].bundle.js';
  config.plugins.splice(config.plugins.findIndex((x) => x.constructor.name === HtmlWebpackPlugin.name), 1);
  return config;
};
