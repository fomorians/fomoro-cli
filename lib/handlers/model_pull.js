var mkdirp = require('mkdirp');
var path = require('path');
var read = require('read');
var zlib = require('zlib');
var fs = require('fs');

var exceptions = require('../exceptions');
var config = require('../config');
var utils = require('../utils');

module.exports = function(key) {
  if (!key) {
    var model = utils.readConfig();
    key = model.name;
  }

  console.log(`This will pull the model at "${key}" from Fomoro.`);
  console.log();
  console.log('\tThe folder "models/" will be created if it does not exist');
  console.log('\tand any existing models may be overwritten.');
  console.log();
  read({ prompt: 'Is this okay? (y/n)' }, (err, yn) => {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
      return;
    }

    if (yn.toLowerCase() === 'y') {
      console.log(`Pulling the model for "${key}"...`);

      mkdirp.sync('models/');
      var model_stream = fs.createWriteStream(`models/${key}.pb`);

      var req = utils.postJSON(config.host + config.model_pull_endpoint, { key: key }, function(err, res, body) {
        if (err) {
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else if (res.statusCode !== 200) {
          err = exceptions.fromResponse(res, body);
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else {
          console.log(`Successfully pulled the model for "${key}".`);
        }
      });

      var gunzip = zlib.createGunzip();
      req.pipe(gunzip).pipe(model_stream);
    } else {
      console.log('Okay, did NOT change anything.');
    }
  });
};
