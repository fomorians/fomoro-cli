var fs = require('fs');
var path = require('path');
var config = require('../config');
var utils = require('../utils');

module.exports = function() {
  var model = JSON.parse(fs.readFileSync('config.json'));
  var key = utils.getKey(model.name, model.version);

  utils.postJSON(config.host + config.model_rm_endpoint, { key: key }, function(err, res, body) {
    utils.logResponse(err, res, body);
  });
};
