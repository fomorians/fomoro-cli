var moment = require('moment');
var request = require('request');
var read = require('read');
var auth = require('./auth');

exports.getKey = function(name, version) {
  return [name, version].join('@');
};

exports.read = function(prompt, silent) {
  return new Promise((resolve, reject) => {
    read({ prompt: prompt, silent: silent }, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  })
};

exports.postJSON = function(uri, json, callback) {
  var token;
  try {
    token = auth.getToken();
  } catch (err) {
    callback(err, null, null);
    return;
  }

  return request({
    uri: uri,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    auth: { bearer: token },
    body: JSON.stringify(json)
  }, function(err, res, body) {
    try {
      body = JSON.parse(body);
    } catch (parseError) {}
    callback(err, res, body);
  });
};

exports.postAnonJSON = function(uri, json, callback) {
  return request({
    uri: uri,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(json)
  }, function(err, res, body) {
    try {
      body = JSON.parse(body);
    } catch (parseError) {}
    callback(err, res, body);
  });
};

function getStart(start, end) {
  var delta = end.getTime() - start.getTime();
  return new Date(start.getTime() + delta);
}

function getFuture(start, end, percent) {
  var delta = end.getTime() - start.getTime();
  return new Date(start.getTime() + (delta * (1 - percent)));
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
  var queuePosition = parseInt(item['QueuePosition']['N'], 10);

  var duration = moment(start).to(getStart(start, end), true);
  var remaining = 'N/A';

  if (state == 'running') {
    remaining = moment(start).to(getFuture(start, end, (totalEpochs / completedEpochs)), true);
  } else {
    remaining = moment().to(end);
  }

  return {
    state: state,
    percent: percent,
    progress: progress,
    duration: duration,
    remaining: remaining,
    position: queuePosition,
    completed: completedEpochs,
    total: totalEpochs,
  };
};
