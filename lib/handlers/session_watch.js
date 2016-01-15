var fs = require('fs');
var path = require('path');
var ProgressBar = require('progress');
var config = require('../../config.json');
var utils = require('../utils');

function fetch(key) {
  return new Promise(function(resolve, reject) {
    utils.postJSON(config.host + config.session_info_endpoint, { key: key }, function(err, res, body) {
      if (err) {
        reject(err);
      } else {
        var response = JSON.parse(body);
        var item = response['Item'];
        resolve(item);
      }
    });
  });
}

function poll(progress, key) {
  fetch(key).then(function(item) {
    var state = item['State']['S'];
    var epochs = parseInt(item['CompletedEpochs']['N'], 10);
    var start = new Date(item['StartTime']['S']);

    progress.start = start;
    progress.tick(epochs - progress.curr, {
      state: state
    });

    if (state == 'running' || state == 'queued') {
      setTimeout(function() {
        poll(progress, key);
      }, 5 * 1000);
    } else {
      console.log('');
    }
  }, function(err) {
    console.error(err.stack);
    process.exit(1);
  });
}

module.exports = function() {
  var model = JSON.parse(fs.readFileSync('config.json'));
  var key = utils.getKey(model.name, model.version);
  var total = model.options.hyperparameters.epochs;

  var progress = new ProgressBar(':state [:bar] :percent (:current/:total) Duration: :elapseds ETA: :etas', {
    total: total,
    width: 20
  });

  poll(progress, key);
};
