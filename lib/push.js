var request = require('request');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var ProgressBar = require('progress');
var Promise = require('es6-promise').Promise;
var config = require('../config.json');
var Spinner = require('cli-spinner').Spinner;

var temp = require('temp');
temp.track();

function compress(filepath) {
  return new Promise(function(resolve, reject) {
    var gzip = zlib.createGzip();
    var rstream = fs.createReadStream(filepath);
    var wstream = temp.createWriteStream();

    rstream.pipe(gzip).pipe(wstream);

    var progress;

    rstream.on('open', function(fd) {
      var total = fs.fstatSync(fd).size;
      progress = new ProgressBar('Compressing... [:bar] :percent :etas', {
        total: total
      });
    });

    rstream.on('data', function(chunk) {
      progress.tick(chunk.length);
    });

    wstream.on('finish', function() {
      console.log('Compression complete.');
      resolve(wstream);
    });
  });
}

function upload(metadata, stream) {
  return new Promise(function(resolve, reject) {
    // We start with a progressbar for reading then switch
    // to a spinner until the server is finished.
    var spinner = new Spinner('Uploading... %s');
    spinner.setSpinnerString(5);
    spinner.setSpinnerDelay(100);

    var req = request({
      uri: config.push_endpoint,
      method: 'POST',
      timeout: 0,
      forever: true
    }, function(err, res, body) {
      spinner.stop();

      if (err) {
        console.error(err.connect, err.code, err.stack);
        reject(err);
      } else if (res.statusCode !== 200) {
        console.log('Failed to complete request.');
        reject(new Error('Failed to complete request.'));
      } else {
        console.log('Upload complete.', body);
        resolve(body);
      }
    });

    var rstream = fs.createReadStream(stream.path);

    var form = req.form();
    form.append('metadata', JSON.stringify(metadata));
    form.append('file', rstream);

    var progress;

    rstream.on('data', function(chunk) {
      progress.tick(chunk.length);
    });

    rstream.on('end', function() {
      spinner.start();
    });

    req.on('request', function() {
      var total = req.headers['content-length'];
      progress = new ProgressBar('Uploading... [:bar] :percent :etas', {
        total: total
      });
    });
  });
}

module.exports = function() {
  var metadata = JSON.parse(fs.readFileSync('config.json'));
  var relpath = metadata.file;
  compress(relpath).then(function(stream) {
    return upload(metadata, stream);
  }).then(function(body) {
    console.log(body);
  }, function(err) {
    console.error(err.stack);
  });
};
