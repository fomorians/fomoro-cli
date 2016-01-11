var request = require('request');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var Promise = require('es6-promise').Promise;
var Spinner = require('cli-spinner').Spinner;

var config = require('../config.json');

module.exports = function() {
  console.log('Pull');
  var metadata = JSON.parse(fs.readFileSync('config.json'));

  var relpath = metadata.file;
  if (fs.existsSync(relpath)) {
    console.error('File already exists:', relpath);
    process.exit(1);
    return;
  }

  var spinner = new Spinner('Downloading... %s');
  spinner.setSpinnerString(5);
  spinner.setSpinnerDelay(100);
  spinner.start();

  var req = request({
    uri: config.pull_endpoint,
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(metadata)
  }, function(err, res, body) {
    spinner.stop(true);
    console.log('Download complete.');
  });

  var gunzip = zlib.createGunzip();
  var wstream = fs.createWriteStream(relpath);
  req.pipe(gunzip).pipe(wstream);
};
