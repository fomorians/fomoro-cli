var request = require('request');
var config = require('../config.json');

module.exports = function(key) {
  console.log('Stop');
  var req = request({
    uri: config.stop_endpoint,
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ key: key })
  }, function(err, res, body) {
    console.log('Stopped.', body);
  });
};
