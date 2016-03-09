var path = require('path');
var read = require('read');
var fs = require('fs');

var exceptions = require('../exceptions');
var config = require('../config');
var utils = require('../utils');

module.exports = function(modelName) {
  if (!modelName) {
    var model = utils.readConfig();
    modelName = model.name;
  }

  console.log(`This will remove the model "${modelName}" from Fomoro.`);
  console.log('Your local files will not be touched.');
  read({ prompt: 'Is this okay? (y/n)' }, (err, yn) => {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
      return;
    }

    if (yn.toLowerCase() === 'y') {
      console.log(`Removing "${modelName}"...`);
      utils.postJSON(config.host + config.model_rm_endpoint, { model: modelName }, function(err, res, body) {
        if (err) {
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else if (res.statusCode !== 200) {
          err = exceptions.fromResponse(res, body);
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else {
          console.log(`Successfully removed "${modelName}".`);
        }
      });
    } else {
      console.log(`Okay, did NOT remove "${modelName}".`);
    }
  });
};
