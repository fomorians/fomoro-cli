var mkdirp = require('mkdirp');
var path = require('path');
var read = require('read');
var zlib = require('zlib');
var fs = require('fs');

var exceptions = require('../../exceptions');
var config = require('../../config');
var utils = require('../../utils');

module.exports = function(key) {
  if (!key) {
    var dataset = utils.readConfig();
    key = `${dataset.name}@${dataset.version}`;
  }

  console.log(`This will download the dataset at "${key}" from Fomoro.`);
  console.log();
  console.log('\tThe folder "datasets/" will be created if it does not exist');
  console.log('\tand any existing datasets may be overwritten.');
  console.log();
  read({ prompt: 'Is this okay? (y/n)' }, (err, yn) => {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
      return;
    }

    if (yn.toLowerCase() === 'y') {
      console.log(`Downloading the dataset for "${key}"...`);

      mkdirp.sync('datasets/');
      var dataset_stream = fs.createWriteStream(`datasets/${key}`);

      var req = utils.postJSON(config.host + config.data_download_endpoint, { key: key }, function(err, res, body) {
        if (err) {
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else if (res.statusCode !== 200) {
          err = exceptions.fromResponse(res, body);
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else {
          console.log(`Successfully downloaded the dataset for "${key}".`);
        }
      });

      var gunzip = zlib.createGunzip();
      req.pipe(gunzip).pipe(dataset_stream);
    } else {
      console.log('Okay, did NOT change anything.');
    }
  });
};
