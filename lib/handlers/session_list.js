var Table = require('cli-table');
var moment = require('moment');
var path = require('path');
var fs = require('fs');

var exceptions = require('../exceptions');
var config = require('../config');
var utils = require('../utils');

module.exports = function() {
  utils.postJSON(config.host + config.session_list_endpoint, {}, function(err, res, body) {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else if (res.statusCode !== 200) {
      err = exceptions.fromResponse(res, body);
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else {
      var table = new Table({
        chars: {
          'top': '',
          'top-mid': '',
          'top-left': '',
          'top-right': '',
          'bottom': '',
          'bottom-mid': '',
          'bottom-left': '',
          'bottom-right': '',
          'left': '',
          'left-mid': '',
          'mid': '',
          'mid-mid': '',
          'right': '',
          'right-mid': '',
          'middle': ' | '
        },
        head: ["Model", "State", "Percent", "Epoch", "Duration", "Remaining"],
        style: { 'padding-left': 0, 'padding-right': 0 }
      });

      body['Items'].forEach(function(item) {
        var modelId = item['ModelId']['S'];
        var status = utils.getStatus(item);
        table.push([
          modelId,
          status.state,
          status.percent,
          status.progress,
          status.duration,
          status.remaining
        ]);
      });

      console.log(table.toString());
    }
  });
};
