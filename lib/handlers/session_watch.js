var path = require('path');
var fs = require('fs');

var exceptions = require('../exceptions');
var config = require('../config');
var utils = require('../utils');

function fetch(key) {
  return new Promise(function(resolve, reject) {
    utils.postJSON(config.host + config.session_info_endpoint, { key: key }, function(err, res, body) {
      if (err) {
        reject(err);
      } else {
        resolve(body['Item']);
      }
    });
  });
}

function poll(key) {
  fetch(key).then(function(item) {
    var status = utils.getStatus(item);
    var message = `${status.state} (${status.percent}%, ${status.completed}/${status.total}) duration: ${status.duration}, remaining: ${status.remaining}`;
    process.stdout.write('\r' + message);

    if (status.state == 'running' || status.state == 'queued') {
      setTimeout(function() {
        poll(key);
      }, 5 * 1000);
    } else {
      console.log('');
    }
  }, function(err) {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
}

module.exports = function() {
  var model = JSON.parse(fs.readFileSync('config.json'));
  var key = utils.getKey(model.name, model.version);
  poll(key);
};
