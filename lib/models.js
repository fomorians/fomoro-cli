var request = require('request');
var config = require('../config.json');

module.exports = function() {
  console.log('Models');
  var req = request({
    uri: config.models_endpoint,
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    }
  }, function(err, res, body) {
    console.log('Models:', body);
  });
};
