"use strict";

var Git = require('nodegit');

var exceptions = require('../exceptions');
var config = require('../config');
var utils = require('../utils');

function pollSessionInfo(model, sha) {
  utils.fetchSession(model, sha).then(session => {
    var message = utils.getSessionMessage(session);
    process.stdout.write('\r' + message);

    if (session['State'] == 'running' || session['State'] == 'queued') {
      setTimeout(function() {
        pollSessionInfo(model, sha);
      }, 10 * 1000);
    } else {
      console.log('');
    }
  }, function(err) {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
}

module.exports = function(sha) {
  let model = utils.readConfig();
  if (sha) {
    pollSessionInfo(model, sha);
  } else {
    Git.Repository.open('.').then(repo => repo.getHeadCommit()).then(commit => {
      let sha = commit.toString();
      pollSessionInfo(model, sha);
    });
  }
};
