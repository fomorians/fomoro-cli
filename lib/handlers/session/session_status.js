"use strict";

var Git = require('nodegit');

var exceptions = require('../../exceptions');
var config = require('../../config');
var utils = require('../../utils');

function getSessionInfo(model, sha) {
  utils.fetchSession(model, sha).then(session => {
    var message = utils.getSessionMessage(session);
    console.log(message);
  }).catch(err => {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
}

module.exports = function(sha) {
  let model = utils.readConfig();
  if (sha) {
    getSessionInfo(model, sha);
  } else {
    Git.Repository.open('.').then(repo => repo.getHeadCommit()).then(commit => {
      let sha = commit.toString();
      try {
        getSessionInfo(model, sha);
      } catch (err) {
        console.error(err.stack);
      }
    });
  }
};
