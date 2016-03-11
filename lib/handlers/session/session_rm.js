"use strict";

var path = require('path');
var read = require('read');
var fs = require('fs');

var exceptions = require('../../exceptions');
var config = require('../../config');
var utils = require('../../utils');

function removeSession(model, sha) {
  let sha_ = sha.slice(0, 8);

  console.log(`This will remove the training session "${model.name}" at ${sha_} from Fomoro.`);
  console.log();
  console.log('All artifacts from the training session will be removed as well.');
  console.log('Your local files will not be touched.');
  console.log();
  read({ prompt: 'Is this okay? (y/n)' }, (err, yn) => {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
      return;
    }

    if (yn.toLowerCase() === 'y') {
      console.log(`Removing "${model.name}" at ${sha_}...`);
      utils.postJSON(config.host + config.session_remove_endpoint, { model: model.name, sha: sha }, function(err, res, body) {
        if (err) {
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else if (res.statusCode !== 200) {
          err = exceptions.fromResponse(res, body);
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else {
          console.log(`Successfully removed "${model.name}" at ${sha_}.`);
        }
      });
    } else {
      console.log(`Okay, did NOT remove "${model.name}" at ${sha_}.`);
    }
  });
}

module.exports = function(sha) {
  let model = utils.readConfig();
  if (sha) {
    removeSession(model, sha);
  } else {
    Git.Repository.open('.').then(repo => repo.getHeadCommit()).then(commit => {
      let sha = commit.toString();
      removeSession(model, sha);
    });
  }
};
