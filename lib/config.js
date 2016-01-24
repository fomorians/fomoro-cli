var config = require('../config.json');

// we don't default to development so that users get the correct config
if (process.env.NODE_ENV === 'development') {
  var dev_config = require('../dev.config.json');
  Object.assign(config, dev_config);
}

module.exports = config;
