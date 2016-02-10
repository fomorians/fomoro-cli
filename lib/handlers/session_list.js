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
      var header = ["Model", "State", "Percent", "Epoch", "Duration", "Remaining"];
      var items = body['Items'].map(function(item) {
        var modelId = item['ModelId']['S'];
        var status = utils.getStatus(item);
        return [
          modelId,
          status.state,
          status.percent,
          status.progress,
          status.duration,
          status.remaining
        ];
      });
      utils.renderTable(items, header);
    }
  });
};
