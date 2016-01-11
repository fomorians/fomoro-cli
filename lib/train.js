var request = require('request');
var fs = require('fs');
var config = require('../config.json');

module.exports = function(confpath, args) {
  console.log('Train');
  var metadata = JSON.parse(fs.readFileSync(confpath));

  var req = request({
    url: config.train_endpoint,
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(options)
  }, function(err, res, body) {
    if (err) {
      console.error(err.stack);
      process.exit(1);
      return;
    }

    console.log(body);
  });
};
