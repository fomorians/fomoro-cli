'use strict';

const moment = require('moment');

const exceptions = require('./exceptions');
const config = require('./config');
const utils = require('./utils');

const lineEnding = /\r?\n$/;
const whitespace = /^\s+$/;

function printLogs(events) {
  events.forEach(e => {
    // If the line has line endings, use those
    if (!whitespace.test(e.message)) {
      if (lineEnding.test(e.message)) {
        process.stdout.write(`[${moment(e.timestamp)}] ${e.message}`);
      } else {
        console.log(`[${moment(e.timestamp)}] ${e.message}`);
      }
    }
  });
}

exports.pollSessionInfo = function pollSessionInfo(model, sha) {
  utils.fetchSession(model, sha).then(session => {
    let item = utils.getSessionMessage(session);
    let table = utils.table([item], []);
    process.stdout.write('\r' + table.toString());

    let state = session['State'];
    if (state === 'running' || state === 'queued' || state === 'stopping') {
      setTimeout(() => {
        pollSessionInfo(model, sha);
      }, 5 * 1000);
    } else {
      console.log('');
    }
  }, function(err) {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
};

exports.getNextSessionLogs = function getNextSessionLogs(model, sha, num, follow, nextToken) {
  utils.postJSON(config.host + config.session_logs_endpoint, {
    model: model.name,
    sha: sha,
    limit: num,
    nextToken: nextToken
  }, function(err, res, body) {
    if (follow) {
      if (!err && res.statusCode === 200) {
        printLogs(body.events);
      }
      setTimeout(getNextSessionLogs.bind(null, model, sha, num, follow, body.nextForwardToken), 5 * 1000);
    } else {
      if (err) {
        console.error(exceptions.getUserMessage(err));
        process.exit(1);
      } else if (res.statusCode !== 200) {
        err = exceptions.fromResponse(res, body);
        console.error(exceptions.getUserMessage(err));
        process.exit(1);
      } else {
        printLogs(body.events);
      }
    }
  });
};

exports.startSession = function startSession(model, sha, watch, follow) {
  let sha_ = sha.slice(0, 8);

  console.log(`Starting "${model.name}" at ${sha_}...`);
  utils.postJSON(config.host + config.session_start_endpoint, { model: model.name, sha: sha }, (err, res, body) => {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else if (res.statusCode !== 200) {
      err = exceptions.fromResponse(res, body);
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else {
      console.log(`Successfully started "${model.name}" at ${sha_}.`);

      if (watch) {
        exports.pollSessionInfo(model, sha);
      } else if (follow) {
        exports.getNextSessionLogs(model, sha, 10, true);
      }
    }
  });
};
