var mkdirp = require('mkdirp');
var path = require('path');
var read = require('read');
var zlib = require('zlib');
var fs = require('fs');

var exceptions = require('../exceptions');
var config = require('../config');
var utils = require('../utils');

module.exports = function(key) {
  if (!key) key = utils.loadKey();

  console.log(`This will pull the latest summary logs for "${key}" from Fomoro.`);
  console.log();
  console.log('\tThe folder "logs/" will be created if it does not exist');
  console.log('\tand any existing logs may be overwritten.');
  console.log();
  read({ prompt: 'Is this okay? (y/n)' }, (err, yn) => {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
      return;
    }

    if (yn.toLowerCase() === 'y') {
      console.log(`Pulling latest summary logs for "${key}"...`);

      mkdirp.sync('logs/');
      var summary_stream = fs.createWriteStream(`logs/events.out.tfevents.${key}.local`);

      var req = utils.postJSON(config.host + config.summary_pull_endpoint, { key: key }, function(err, res, body) {
        if (err) {
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else if (res.statusCode !== 200) {
          err = exceptions.fromResponse(res, body);
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else {
          console.log(`Successfully pulled latest summary logs for "${key}".`);
        }
      });

      var gunzip = zlib.createGunzip();
      req.pipe(gunzip).pipe(summary_stream);
    } else {
      console.log('Okay, did NOT change anything.');
    }
  });
};
