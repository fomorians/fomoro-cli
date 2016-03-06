var moment = require('moment');
var path = require('path');
var fs = require('fs');

var exceptions = require('../exceptions');
var config = require('../config');
var utils = require('../utils');

module.exports = function(key) {
  if (!key) key = utils.loadKey();

  utils.postJSON(config.host + config.session_logs_endpoint, { key: key }, function(err, res, body) {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else if (res.statusCode !== 200) {
      err = exceptions.fromResponse(res, body);
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else if (!body['Item']) {
      console.log(`Could not find any sessions for ${key}`);
    } else {
      console.log(body);
    }
  });
};
