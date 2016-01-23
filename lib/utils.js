var moment = require('moment');
var request = require('request');
var auth = require('./auth');

exports.getKey = function(name, version) {
  return [name, version].join('@');
};

exports.logResponse = function(err, res, body) {
  if (err) {
    console.error('Command failed.');
    console.error(err.stack);
    process.exit(1);
  } else if (res.statusCode !== 200) {
    console.error('Request failed.');
    console.error(body);
    process.exit(1);
  } else {
    console.log('Success!');
  }
};

exports.postJSON = function(uri, json, callback) {
  Object.assign(json, {
    token: auth.getToken()
  });
  return request({
    uri: uri,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(json)
  }, callback);
}

exports.printStatus = function(item, shouldUpdate) {
    var state = item['State']['S'];
    var startTime = item['StartTime']['S'];
    var endTime = item['EndTime']['S'];

    var start = startTime ? new Date(startTime) : new Date();
    var end = endTime ? new Date(endTime) : new Date();
    var completedEpochs = parseInt(item['CompletedEpochs']['N']);
    var totalEpochs = parseInt(item['TotalEpochs']['N']);
    var percent = ((completedEpochs / totalEpochs) * 100).toFixed(1);
    var diff = end.getTime() - start.getTime();
    var eta = diff * (totalEpochs / completedEpochs);
    var estimated = new Date(end.getTime() + eta);
    var remaining = moment().to(estimated, true);
    var duration = moment().to(start, true);

    var statusTemplate = ':state (:percent%, :completed/:total) duration: :duration, remaining: :remaining';
    var status = statusTemplate.replace(/\:(\w+)/gi, ($0, $1) => {
      switch ($1) {
        case 'state':
          return state;
        case 'percent':
          return percent;
        case 'completed':
          return completedEpochs;
        case 'total':
          return totalEpochs;
        case 'duration':
          return duration;
        case 'remaining':
          return remaining;
      }
    });

    if (shouldUpdate) {
      process.stdout.write('\r' + status);
    } else {
      console.log(status);
    }
}
