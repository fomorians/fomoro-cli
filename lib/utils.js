var Table = require('cli-table');
var moment = require('moment');
var request = require('request');
var read = require('read');
var fs = require('fs');
var toml = require('toml');

var config = require('./config');
var auth = require('./auth');

exports.readConfig = function() {
  return toml.parse(fs.readFileSync('fomoro.toml'));
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

exports.table = function(items, head) {
  var table = new Table({
    chars: {
      'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
      'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
      'left': '', 'left-mid': '',
      'mid': '', 'mid-mid': '',
      'right': '', 'right-mid': '',
      'middle': ' | '
    },

    head: head,
    style: { 'padding-left': 0, 'padding-right': 0 }
  });

  table.push.apply(table, items);

  return table;
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

exports.fetchSession = function(model, sha) {
  return new Promise((resolve, reject) => {
    var sha_ = sha.slice(0, 8);
    exports.postJSON(config.host + config.session_info_endpoint, { model: model.name, sha: sha }, (err, res, body) => {
      if (err) {
        reject(err);
      } else if (res.statusCode !== 200) {
        reject(exceptions.fromResponse(res, body));
      } else if (!body['Item']) {
        reject(new Error(`Could not find any sessions for ${model.name} @ ${sha_}`));
      } else {
        resolve(body['Item']);
      }
    });
  });
};

exports.getSessionMessage = function(session) {
  var state = session['State'];

  var startTime = session['StartTime'] ? new Date(session['StartTime']) : new Date();
  var endTime = session['EndTime'] ? new Date(session['EndTime']) : new Date();

  var queuePosition = session['QueuePosition'];

  var startMS = startTime.getTime();
  var endMS = endTime.getTime();
  var duration = moment(startMS).to(new Date(startMS + (startMS - endMS)), true);

  if (state === 'running') {
    return `${state} (${duration})`;
  } else if (state === 'queued') {
    return `${state} (#${queuePosition})`;
  } else if (state === 'completed') {
    return `${state} (${duration})`;
  } else {
    return `${state}`;
  }
};
