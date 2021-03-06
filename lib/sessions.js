'use strict';

const moment = require('moment');

const exceptions = require('./exceptions');
const config = require('./config');
const utils = require('./utils');

const whitespace = /^\s+$/;

function printLogs(events) {
  events.forEach(e => {
    // If the line has line endings, use those
    if (!whitespace.test(e.message)) {
      console.log(`[${moment(e.timestamp)}] ${e.message}`);
    }
  });
}

exports.pollSessionInfo = function pollSessionInfo(modelName, sha) {
  utils.fetchSession(modelName, sha).then(session => {
    let item = utils.getSessionMessage(session);
    let table = utils.table([item], []);
    process.stdout.write('\r' + table.toString());

    let state = session['State'];
    if (state === 'running' || state === 'queued' || state === 'stopping') {
      setTimeout(() => {
        pollSessionInfo(modelName, sha);
      }, 5 * 1000);
    } else {
      console.log('');
    }
  }, function(err) {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
};

exports.getNextSessionLogs = function getNextSessionLogs(modelName, sha, num, follow, nextToken) {
  utils.postJSON(config.host + config.session_logs_endpoint, {
    model: modelName,
    sha: sha,
    limit: num,
    nextToken: nextToken
  }, function(err, res, body) {
    if (follow) {
      if (!err && res.statusCode === 200) {
        printLogs(body.events);
      }
      setTimeout(getNextSessionLogs.bind(null, modelName, sha, num, follow, body.nextForwardToken), 5 * 1000);
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

exports.startSession = function startSession(modelName, sha, watch, follow) {
  let sha_ = sha.slice(0, 8);

  console.log(`Starting "${modelName}" at ${sha_}...`);
  utils.postJSON(config.host + config.session_start_endpoint, { model: modelName, sha: sha }, (err, res, body) => {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else if (res.statusCode !== 200) {
      err = exceptions.fromResponse(res, body);
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else {
      console.log(`Successfully started "${modelName}" at ${sha_}.`);

      if (watch) {
        exports.pollSessionInfo(modelName, sha);
      } else if (follow) {
        exports.getNextSessionLogs(modelName, sha, 10, true);
      }
    }
  });
};
