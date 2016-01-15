var fs = require('fs');
var path = require('path');
var config = require('../../config.json');
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

    var state = item['State']['S'];

    var start = new Date(item['StartTime']['S']);
    var end = new Date(item['EndTime']['S']);
    var step = parseInt(item['GlobalStep']['N'], 10);

    var epochs = parseInt(item['CompletedEpochs']['N']);
    var total = parseInt(item['TotalEpochs']['N']);
    var percent = (epochs / total) * 100;

    console.log(state, percent + '%', (end.getTime() - start.getTime()) / 1000, 'epoch', epochs, 'step', step);
  });
};
