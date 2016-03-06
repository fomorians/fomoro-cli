"use strict";

var Git = require('nodegit');

var exceptions = require('../exceptions');
var config = require('../config');
var utils = require('../utils');

function getSessionLogs(model, sha) {
  let sha_ = sha.slice(0, 8);

  console.log(`Fetching logs for "${model.name}" at ${sha_}...`);
  utils.postJSON(config.host + config.session_logs_endpoint, { model: model.name, sha: sha }, function(err, res, body) {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else if (res.statusCode !== 200) {
      err = exceptions.fromResponse(res, body);
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else if (!body['Item']) {
      console.log(`Could not find any logs for ${model.name} at ${sha_}`);
    } else {
      console.log(body);
    }
  });
}

module.exports = function(sha) {
  let model = utils.readConfig();
  if (sha) {
    getSessionLogs(model, sha);
  } else {
    Git.Repository.open('.').then(repo => repo.getHeadCommit()).then(commit => {
      let sha = commit.toString();
      getSessionLogs(model, sha);
    });
  }
};
