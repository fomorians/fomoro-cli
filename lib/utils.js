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

exports.getStatus = function(item) {
  var state = item['State']['S'];
  var startTime = item['StartTime']['S'];
  var endTime = item['EndTime']['S'];

  var start = startTime ? new Date(startTime) : new Date();
  var end = endTime ? new Date(endTime) : new Date();
  var completedEpochs = parseInt(item['CompletedEpochs']['N'], 10);
  var totalEpochs = parseInt(item['TotalEpochs']['N'], 10);
  var percent = ((completedEpochs / totalEpochs) * 100).toFixed(1);
  var progress = completedEpochs + '/' + totalEpochs;

  var duration = moment().to(start, true);
  var remaining = 'N/A';

  if (state == 'running') {
    var delta = end.getTime() - start.getTime();
    var eta = delta * (totalEpochs / (completedEpochs - 1));
    var estimated = new Date(end.getTime() + eta);
    remaining = moment().to(estimated, true);
  } else {
    remaining = moment().to(end);
  }

  return {
    state: state,
    percent: percent,
    progress: progress,
    duration: duration,
    remaining: remaining,
    completed: completedEpochs,
    total: totalEpochs,
  };
};

exports.printStatus = function(item, shouldUpdate) {
    var statusTemplate = ':state (:percent%, :completed/:total) duration: :duration, remaining: :remaining';
    var status = exports.getStatus(item);
    var message = statusTemplate.replace(/\:(\w+)/gi, ($0, $1) => {
      switch ($1) {
        case 'state':
          return status.state;
        case 'percent':
          return status.percent;
        case 'completed':
          return status.completed;
        case 'total':
          return status.total;
        case 'duration':
          return status.duration;
        case 'remaining':
          return status.remaining;
      }
    });

    if (shouldUpdate) {
      process.stdout.write('\r' + message);
    } else {
      console.log(message);
    }
}
