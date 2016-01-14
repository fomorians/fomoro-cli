var fs = require('fs');
var path = require('path');
var config = require('../../config.json');
var utils = require('../utils');
var mkdirp = require('mkdirp');
var zlib = require('zlib');
var Spinner = require('cli-spinner').Spinner;

module.exports = function() {
  var model = JSON.parse(fs.readFileSync('config.json'));
  var key = utils.getKey(model.name, model.version);

  mkdirp.sync('checkpoints/');

  var spinner = new Spinner('Downloading... %s');
  spinner.setSpinnerString(5);
  spinner.setSpinnerDelay(100);
  spinner.start();

  var checkpoint_stream = fs.createWriteStream('checkpoints/latest.ckpt');
  checkpoint_stream.on('finish', function() {
    spinner.stop(true);
  });

  var req = utils.postJSON(config.checkpoint_pull_endpoint, { key: key }, function(err, res, body) {
    console.log();
    if (err) {
      console.error('Command failed.');
      console.error(err.stack);
      process.exit(1);
    } else if (res.statusCode !== 200) {
      console.error('Request failed.');
      console.error(body);
      process.exit(1);
    } else {
      console.log('Download complete.');
    }
  });

  var gunzip = zlib.createGunzip();
  req.pipe(gunzip).pipe(checkpoint_stream);
};
