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
        head: ["Model", "State", "Percent", "Epochs", "Duration", "Remaining"],
        style: { 'padding-left': 0, 'padding-right': 0 }
      });

      response['Items'].forEach(function(item) {
        var modelId = item['ModelId']['S'];
        var state = item['State']['S'];
        var startTime = item['StartTime']['S'];
        var endTime = item['EndTime']['S'];
        var start = startTime ? new Date(startTime) : new Date();
        var end = endTime ? new Date(endTime) : new Date();
        var completedEpochs = parseInt(item['CompletedEpochs']['N']);
        var totalEpochs = parseInt(item['TotalEpochs']['N']);
        var percent = ((completedEpochs / totalEpochs) * 100).toFixed(1) + '%';
        var slice = completedEpochs + '/' + totalEpochs;
        var diff = end.getTime() - start.getTime();
        if (state == 'running') {
          var eta = diff * (1 - (completedEpochs / totalEpochs));
          var estimated = new Date(end.getTime() + eta);
          var remaining = moment().to(estimated, true);
          var duration = moment().to(start, true);
          table.push([modelId, state, percent, slice, duration, remaining]);
        } else {
          table.push([modelId, state, percent, slice, 'N/A', 'N/A']);
        }
      });

      console.log(table.toString());
    }
  });
};
