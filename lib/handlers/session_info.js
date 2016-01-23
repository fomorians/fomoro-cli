var fs = require('fs');
var path = require('path');
var moment = require('moment');
var config = require('../config');
var utils = require('../utils');

module.exports = function() {
  var model = JSON.parse(fs.readFileSync('config.json'));
  var key = utils.getKey(model.name, model.version);

  utils.postJSON(config.host + config.session_info_endpoint, { key: key }, function(err, res, body) {
    if (err) {
      console.error(err.stack);
      process.exit(1);
      return;
    }

    var response = JSON.parse(body);
    var item = response['Item'];
    utils.printStatus(item);
  });
};
