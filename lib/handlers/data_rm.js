var fs = require('fs');
var path = require('path');
var config = require('../config');
var utils = require('../utils');

module.exports = function() {
  var data = JSON.parse(fs.readFileSync('config.json'));
  var key = utils.getKey(data.name, data.version);

  utils.postJSON(config.host + config.data_rm_endpoint, { key: key }, function(err, res, body) {
    utils.logResponse(err, res, body);
  });
};
