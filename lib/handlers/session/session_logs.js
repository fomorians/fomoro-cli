"use strict";

var Git = require('nodegit');
var moment = require('moment');

var exceptions = require('../../exceptions');
var config = require('../../config');
var utils = require('../../utils');

function getNextSessionLogs(model, sha, num, follow, nextToken) {
  let sha_ = sha.slice(0, 8);
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
      body.events.forEach(e => console.log(`[${moment(e.timestamp)}] ${e.message}`));

      if (follow) {
        setTimeout(getNextSessionLogs.bind(null, model, sha, num, follow, body.nextForwardToken), 5 * 1000);
      }
    }
  });
}

module.exports = function(sha, num, follow) {
  let model = utils.readConfig();
  if (sha) {
    getNextSessionLogs(model, sha, num, follow, null);
  } else {
    Git.Repository.open('.').then(repo => repo.getHeadCommit()).then(commit => {
      let sha = commit.toString();
      getNextSessionLogs(model, sha, num, follow, null);
    });
  }
};
