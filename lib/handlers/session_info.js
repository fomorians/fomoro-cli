var moment = require('moment');
var path = require('path');
var fs = require('fs');

var exceptions = require('../exceptions');
var config = require('../config');
var utils = require('../utils');

module.exports = function() {
  var model = JSON.parse(fs.readFileSync('config.json'));
  var key = utils.getKey(model.name, model.version);

  utils.postJSON(config.host + config.session_info_endpoint, { key: key }, function(err, res, body) {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else if (res.statusCode !== 200) {
      err = exceptions.fromResponse(res, body);
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else {
      var status = utils.getStatus(body['Item']);
      var message = `${status.state} (${status.percent}%, ${status.completed}/${status.total}) duration: ${status.duration}, remaining: ${status.remaining}`;
      console.log(message);
    }
  });
};
