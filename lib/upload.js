var request = require('request');
var fs = require('fs');
var path = require('path');
var Promise = require('es6-promise').Promise;
var ProgressBar = require('progress');
var Spinner = require('cli-spinner').Spinner;

var exceptions = require('./exceptions');
var auth = require('./auth');

module.exports = function(endpoint, metadata, stream) {
  return new Promise(function(resolve, reject) {
    // We start with a progressbar for reading then switch
    // to a spinner until the server is finished.
    var spinner = new Spinner('Uploading... %s');
    spinner.setSpinnerString(5);
    spinner.setSpinnerDelay(100);

    var req = request({
      uri: endpoint,
      method: 'POST',
      timeout: 0,
      forever: true
    }, function(err, res, body) {
      spinner.stop();

      try {
        body = JSON.parse(body);
      } catch (parseError) {}

      if (err) {
        reject(err);
      } else if (res.statusCode !== 200) {
        reject(exceptions.fromResponse(res, body));
      } else {
        resolve(body);
      }
    });

    var rstream = fs.createReadStream(stream.path);

    var form = req.form();
    form.append('token', auth.getToken());
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
