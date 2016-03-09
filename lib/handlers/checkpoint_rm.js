"use strict";

var path = require('path');
var read = require('read');
var fs = require('fs');

var Git = require('nodegit');

var exceptions = require('../exceptions');
var config = require('../config');
var utils = require('../utils');

function removeArtifact(model, sha) {
  let sha_ = sha.slice(0, 8);

  console.log(`This will remove the checkpoints for "${model.name}" at ${sha_}.`);
  console.log('Your local files will not be touched.');
  read({ prompt: 'Is this okay? (y/n)' }, (err, yn) => {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
      return;
    }

    if (yn.toLowerCase() === 'y') {
      console.log(`Removing checkpoints for "${model.name}" at ${sha_}...`);
      utils.postJSON(config.host + config.checkpoint_rm_endpoint, { model: model.name, sha: sha }, function(err, res, body) {
        if (err) {
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else if (res.statusCode !== 200) {
          err = exceptions.fromResponse(res, body);
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else {
          console.log(`Successfully removed checkpoints for "${model.name}" at ${sha_}.`);
        }
      });
    } else {
      console.log(`Okay, did NOT remove checkpoints for "${model.name}" ${sha_}.`);
    }
  });
}

module.exports = function(sha) {
  let model = utils.readConfig();
  if (sha) {
    removeArtifact(model, sha);
  } else {
    Git.Repository.open('.').then(repo => repo.getHeadCommit()).then(commit => {
      let sha = commit.toString();
      removeArtifact(model, sha);
    });
  }
};
