var moment = require('moment');

var exceptions = require('../../exceptions');
var config = require('../../config');
var utils = require('../../utils');

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
      var header = ['Session', 'State', 'Duration'];
      var items = body['Items'].map(function(session) {
        return utils.getSessionMessage(session);
      });
      var table = utils.table(items, header);
      console.log(table.toString());
    }
  });
};
