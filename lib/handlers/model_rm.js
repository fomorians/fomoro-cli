var fs = require('fs');
var path = require('path');
var read = require('read');
var config = require('../config');
var utils = require('../utils');

module.exports = function() {
  var model = JSON.parse(fs.readFileSync('config.json'));
  var key = utils.getKey(model.name, model.version);

  console.log(`This will remove the model "${key}" from Fomoro.`);
  read({ prompt: 'Is this okay? (y/n)' }, (err, yn) => {
    if (err) {
      console.error(err.message);
      process.exit(1);
      return;
    }

    if (yn.toLowerCase() === 'y') {
      console.log(`Removing "${key}"...`);
      utils.postJSON(config.host + config.model_rm_endpoint, { key: key }, function(err, res, body) {
        utils.logResponse(err, res, body);
      });
    } else {
      console.log(`Okay, did NOT remove "${key}".`);
    }
  });
};
