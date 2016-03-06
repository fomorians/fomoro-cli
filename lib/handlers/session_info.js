"use strict";

var moment = require('moment');
var path = require('path');
var fs = require('fs');
var Git = require('nodegit');

var exceptions = require('../exceptions');
var config = require('../config');
var utils = require('../utils');

function getSessionInfo(model, sha) {
  utils.postJSON(config.host + config.session_info_endpoint, { model: model.name, sha: sha }, function(err, res, body) {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else if (res.statusCode !== 200) {
      err = exceptions.fromResponse(res, body);
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else if (!body['Item']) {
      console.log(`Could not find any sessions for ${key}`);
    } else {
      var state = item['State'];
      var startTime = item['StartTime'] ? new Date(item['StartTime']) : new Date();
      var endTime = item['EndTime'] ? new Date(item['EndTime']) : new Date();
      var queuePosition = item['QueuePosition'];
      var duration = moment(startTime).to(getStart(startTime, endTime), true);

      if (state === 'running') {
        console.log(`${status.state} (${status.duration})`);
      } else if (state === 'queued') {
        console.log(`${status.state} (${status.position})`);
      } else {
        console.log(`${status.state}`);
      }
    }
  });
}

module.exports = function(sha) {
  let model = utils.readConfig();
  if (sha) {
    getSessionInfo(model, sha);
  } else {
    Git.Repository.open('.').then(repo => repo.getHeadCommit()).then(commit => {
      let sha = commit.toString();
      getSessionInfo(model, sha);
    });
  }
};
