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
    var message;
    if (status.state === 'running') {
      message = `${status.state} (${status.percent}%, ${status.completed}/${status.total}) duration: ${status.duration}, remaining: ${status.remaining}`;
    } else if (status.state === 'queued') {
      message = `${status.state} (#${status.position})`;
    } else {
      message = `${status.state} (${status.percent}%, ${status.completed}/${status.total}) duration: ${status.duration}`;
    }
    process.stdout.write('\r' + message);

    if (status.state == 'running' || status.state == 'queued') {
      setTimeout(function() {
        poll(key);
      }, 10 * 1000);
    } else {
      console.log('');
    }
  }, function(err) {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
}

module.exports = function(key) {
  if (!key) key = utils.loadKey();
  poll(key);
};
