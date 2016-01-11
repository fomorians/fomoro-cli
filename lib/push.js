var request = require('request');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var ProgressBar = require('progress');
var Promise = require('es6-promise').Promise;
var config = require('../config.json');

var temp = require('temp');
temp.track();

function compress(filepath) {
  console.log('Compressing...');

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
    var req = request({
      uri: config.push_endpoint,
      method: 'POST',
      timeout: 0,
      forever: true
    }, function(err, res, body) {
      if (err) {
        console.error(err.connect, err.code, err.stack);
        reject(err);
      } else {
        console.log('Upload complete.', body);
        resolve(body);
      }
    });

    var rstream = fs.createReadStream(stream.path);

    var form = req.form();
    form.append('metadata', JSON.stringify(metadata));
    form.append('blob', rstream);

    var progress;

    rstream.on('data', function(chunk) {
      progress.tick(chunk.length);
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
