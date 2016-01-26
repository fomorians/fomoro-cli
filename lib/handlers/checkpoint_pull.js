var fs = require('fs');
var path = require('path');
var read = require('read');
var mkdirp = require('mkdirp');
var zlib = require('zlib');
var Spinner = require('cli-spinner').Spinner;

var config = require('../config');
var utils = require('../utils');

module.exports = function() {
  var model = JSON.parse(fs.readFileSync('config.json'));
  var key = utils.getKey(model.name, model.version);

  console.log(`This will pull the latest checkpoint for "${key}" from Fomoro.`);
  console.log();
  console.log('\tThe folder "checkpoints/" will be created if it does not exist');
  console.log('\tand any existing checkpoints may be overwritten.');
  console.log();
  read({ prompt: 'Is this okay? (y/n)' }, (err, yn) => {
    if (err) {
      console.error(err.message);
      process.exit(1);
      return;
    }

    if (yn.toLowerCase() === 'y') {
      console.log(`Pulling checkpoints for "${key}"...`);
      mkdirp.sync('checkpoints/');

      var spinner = new Spinner('Downloading... %s');
      spinner.setSpinnerString(5);
      spinner.setSpinnerDelay(100);
      spinner.start();

      var checkpoint_stream = fs.createWriteStream('checkpoints/latest.ckpt');
      checkpoint_stream.on('finish', function() {
        spinner.stop(true);
      });

      var req = utils.postJSON(config.host + config.checkpoint_pull_endpoint, { key: key }, function(err, res, body) {
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
    } else {
      console.log(`Okay, did NOT change anything.`);
    }
  });
};
