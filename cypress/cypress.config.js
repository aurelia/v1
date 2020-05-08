const CLIOptions =  require( 'aurelia-cli').CLIOptions;
const aureliaConfig = require('./aurelia_project/aurelia.json');
const PORT = CLIOptions.getFlagValue('port') || aureliaConfig.platform.port;
const HOST = CLIOptions.getFlagValue('host') || aureliaConfig.platform.host;

module.exports = {
  config: {
    baseUrl: `http://${HOST}:${PORT}`,
    video: false/* @if ci */,
    defaultCommandTimeout: 40000,
    execTimeout: 600000,
    taskTimeout: 600000,
    pageLoadTimeout: 600000,
    requestTimeout: 50000,
    responseTimeout: 300000/* @endif */
  }
};
