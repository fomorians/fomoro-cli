var fs = require('fs');
var path = require('path');
var read = require('read');
var config = require('../config');
var utils = require('../utils');

module.exports = function() {
  var data = JSON.parse(fs.readFileSync('config.json'));
  var key = utils.getKey(data.name, data.version);

  console.log(`This will remove the dataset "${key}" from Fomoro.`);
  read({ prompt: 'Is this okay? (y/n)', timeout: 5 * 1000 }, (err, yn) => {
    if (err) {
      console.error(err.message);
      process.exit(1);
      return;
    }

    if (yn.toLowerCase() === 'y') {
      console.log(`Removing "${key}"...`);
      utils.postJSON(config.host + config.data_rm_endpoint, { key: key }, function(err, res, body) {
        utils.logResponse(err, res, body);
      });
    } else {
      console.log(`Okay, did NOT remove "${key}".`);
    }
  });
};
