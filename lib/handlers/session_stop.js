"use strict";

var read = require('read');

var exceptions = require('../exceptions');
var config = require('../config');
var utils = require('../utils');

var Git = require('nodegit');

function stopSession(model, sha) {
  let sha_ = sha.slice(0, 8);

  console.log(`This will stop the training session for "${model.name}" at ${sha_}.`);
  read({ prompt: 'Is this okay? (y/n)' }, (err, yn) => {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
      return;
    }

    if (yn.toLowerCase() === 'y') {
      console.log(`Stopping "${model.name}" at ${sha_}...`);
      utils.postJSON(config.host + config.session_stop_endpoint, { model: model.name, sha: sha }, (err, res, body) => {
        if (err) {
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else if (res.statusCode !== 200) {
          err = exceptions.fromResponse(res, body);
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else {
          console.log(`Successfully stopped "${model.name}" at ${sha_}.`);
        }
      });
    } else {
      console.log(`Okay, did NOT stop "${model.name}" at ${sha_}.`);
    }
  });
}

module.exports = function(sha) {
  let model = utils.readConfig();
  if (sha) {
    stopSession(model, sha);
  } else {
    Git.Repository.open('.').then(repo => repo.getHeadCommit()).then(commit => {
      let sha = commit.toString();
      stopSession(model, sha);
    });
  }
};
