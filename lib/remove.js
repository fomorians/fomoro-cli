var request = require('request');
var config = require('../config.json');

module.exports = function(key) {
  console.log('Remove');
  var req = request({
    uri: config.remove_endpoint,
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ key: key })
  }, function(err, res, body) {
    console.log('Removed.', body);
  });
};
