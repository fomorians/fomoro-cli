var fs = require('fs');
var path = require('path');
var config = require('../../config.json');
var utils = require('../utils');

module.exports = function() {
  var model = JSON.parse(fs.readFileSync('config.json'));
  var key = utils.getKey(model.name, model.version);

  utils.postJSON(config.host + config.checkpoint_rm_endpoint, { key: key }, function(err, res, body) {
    utils.logResponse(err, res, body);
  });
};
