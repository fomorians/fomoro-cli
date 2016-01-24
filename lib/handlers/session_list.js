var fs = require('fs');
var path = require('path');
var moment = require('moment');
var config = require('../config');
var utils = require('../utils');
var Table = require('cli-table');

module.exports = function() {
  utils.postJSON(config.host + config.session_list_endpoint, {}, function(err, res, body) {
    if (err) {
      console.error('Command failed.');
      console.error(err.stack);
      process.exit(1);
    } else if (res.statusCode !== 200) {
      console.error('Request failed.');
      console.error(body);
      process.exit(1);
    } else {
      var response = JSON.parse(body);

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

      response['Items'].forEach(function(item) {
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
