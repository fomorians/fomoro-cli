"use strict";

const moment = require('moment');

const exceptions = require('../../exceptions');
const config = require('../../config');
const utils = require('../../utils');

const lineEnding = /\r?\n$/;

function getNextSessionLogs(model, sha, num, follow, nextToken) {
  utils.postJSON(config.host + config.session_logs_endpoint, {
    model: model.name,
    sha: sha,
    limit: num,
    nextToken: nextToken
  }, function(err, res, body) {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else if (res.statusCode !== 200) {
      err = exceptions.fromResponse(res, body);
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else {
      body.events.forEach(e => {
        // If the line has line endings, use those
        if (lineEnding.test(e.message)) {
          process.stdout.write(`[${moment(e.timestamp)}] ${e.message}`);
        } else {
          console.log(`[${moment(e.timestamp)}] ${e.message}`);
        }
      });

      if (follow) {
        setTimeout(getNextSessionLogs.bind(null, model, sha, num, follow, body.nextForwardToken), 5 * 1000);
      }
    }
  });
}

module.exports = function(sha, num, follow) {
  let model = utils.readConfig();

  utils.getSha(sha).then(sha => {
    let sha_ = sha.slice(0, 8);
    console.log(`Fetching logs for "${model.name}" at ${sha_}...`);

    getNextSessionLogs(model, sha, num, follow, null);
  }).catch(err => {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
};
