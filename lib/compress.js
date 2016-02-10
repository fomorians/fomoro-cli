var request = require('request');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var Promise = require('es6-promise').Promise;
var ProgressBar = require('progress');
var Spinner = require('cli-spinner').Spinner;

var temp = require('temp');
temp.track();

module.exports = function(filepath) {
  return new Promise(function(resolve, reject) {
    var gzip = zlib.createGzip();
    var rstream = fs.createReadStream(filepath);
    var wstream = temp.createWriteStream();

    rstream.pipe(gzip).pipe(wstream);

    var progress;

    rstream.on('open', function(fd) {
      var total = fs.fstatSync(fd).size;
      progress = new ProgressBar('Compressing... [:bar] :percent :etas', {
        total: total,
        clear: true
      });
    });

    rstream.on('data', function(chunk) {
      progress.tick(chunk.length);
    });

    wstream.on('finish', function() {
      resolve(wstream);
    });
  });
}
