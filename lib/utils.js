"use strict";

var Table = require('cli-table');
var moment = require('moment');
var request = require('request');
var read = require('read');
var fs = require('fs');
var toml = require('toml');
var domain = require('domain');
var zlib = require('zlib');
var Git = require('nodegit');

var exceptions = require('./exceptions');
var config = require('./config');
var auth = require('./auth');

exports.getRemotes = function() {
  return Git.Repository.open('.')
    .then(repo => Git.Remote.lookup(repo, 'origin'))
    .then(remote => remote.url())
    .catch(err => Promise.resolve());
};

exports.getSha = function(id) {
  return Git.Repository.open('.').then(repo => {
    if (!id) {
      return repo.getHeadCommit().then(commit => commit.sha());
    }

    return Git.Reference.dwim(repo, id)
      .then(ref => ref.peel(Git.Object.TYPE.COMMIT))
      .then(obj => obj.id().toString())
      .catch(err => {
        return Git.Commit.lookupPrefix(repo, Git.Oid.fromString(id), id.length)
          .then(commit => commit.sha());
      });
  });
};

exports.readConfig = function() {
  try {
    return toml.parse(fs.readFileSync('fomoro.toml'));
  } catch (err) {
    console.log(exceptions.getUserMessage(err.message));
    process.exit(1);
  }
};

exports.read = function(prompt, silent) {
  return new Promise((resolve, reject) => {
    read({ prompt: prompt, silent: silent }, (err, res) => {
      if (err) {
        if (err.message === 'canceled') {
          reject(new exceptions.CancelledException());
        } else {
          reject(err);
        }
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

exports.deflate = function(src_path, dst_path) {
  return new Promise((resolve, reject) => {
    let d = domain.create();
    d.on('error', (err) => reject(err));
    d.run(() => {
      var unzip = zlib.createUnzip();
      let stream_read = fs.createReadStream(src_path);
      let stream_write = fs.createWriteStream(dst_path);
      let stream_unzip = stream_read.pipe(unzip).pipe(stream_write);
      stream_unzip.on('finish', () => resolve());
    });
  });
};

exports.download = function(stream_read, dest_path) {
  return new Promise((resolve, reject) => {
    let d = domain.create();
    d.on('error', (err) => reject(err));
    d.run(() => {
      let stream_write = fs.createWriteStream(dest_path);
      let stream_pipe = stream_read.pipe(stream_write);
      stream_pipe.on('finish', () => resolve());
    });
  });
};

exports.postJSONDownload = function(uri, json) {
  return request({
    uri: uri,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    auth: { bearer: auth.getToken() },
    body: JSON.stringify(json)
  });
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

exports.fetchSession = function(modelName, sha) {
  return new Promise((resolve, reject) => {
    var sha_ = sha.slice(0, 8);
    exports.postJSON(config.host + config.session_status_endpoint, { model: modelName, sha: sha }, (err, res, body) => {
      if (err) {
        reject(err);
      } else if (res.statusCode !== 200) {
        reject(exceptions.fromResponse(res, body));
      } else if (!body['Item']) {
        reject(new Error(`Could not find any sessions for ${modelName} @ ${sha_}`));
      } else {
        resolve(body['Item']);
      }
    });
  });
};

exports.getSessionMessage = function(session) {
  var sessionId = session['SessionId'];
  var state = session['State'];

  var startTime = session['StartTime'] ? new Date(session['StartTime']) : new Date();
  var endTime = session['EndTime'] ? new Date(session['EndTime']) : new Date();

  var queuePosition = session['QueuePosition'];

  var startMS = startTime.getTime();
  var endMS = endTime.getTime();
  var duration = moment(startMS).to(new Date(startMS + (startMS - endMS)), true);

  if (state === 'queued') {
    duration = `(#${queuePosition})`;
  }

  return [
    sessionId,
    state,
    duration
  ];
};
