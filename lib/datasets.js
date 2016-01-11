var request = require('request');
var config = require('../config.json');

module.exports = function() {
  console.log('Datasets');
  var req = request({
    uri: config.datasets_endpoint,
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    }
  }, function(err, res, body) {
    console.log('Datasets:', body);
  });
};
