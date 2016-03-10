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
        var sessionId = session['SessionId'];
        var state = session['State'];

        var queuePosition = session['QueuePosition'];

        var startTime = session['StartTime'] ? new Date(session['StartTime']) : new Date();
        var endTime = session['EndTime'] ? new Date(session['EndTime']) : new Date();

        var startMS = startTime.getTime();
        var endMS = endTime.getTime();
        var duration = moment(startMS).to(new Date(startMS + (startMS - endMS)), true);

        return [
          sessionId,
          state,
          duration
        ];
      });
      var table = utils.table(items, header);
      console.log(table.toString());
    }
  });
};
