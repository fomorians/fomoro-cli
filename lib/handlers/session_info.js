"use strict";

var moment = require('moment');
var path = require('path');
var fs = require('fs');
var Git = require('nodegit');

var exceptions = require('../exceptions');
var config = require('../config');
var utils = require('../utils');

function fetch(model, sha) {
  return new Promise((resolve, reject) => {
    var sha_ = sha.slice(0, 8);
    utils.postJSON(config.host + config.session_info_endpoint, { model: model.name, sha: sha }, (err, res, body) => {
      if (err) {
        reject(err);
      } else if (res.statusCode !== 200) {
        reject(exceptions.fromResponse(res, body));
      } else if (!body['Item']) {
        reject(new Error(`Could not find any sessions for ${model.name} @ ${sha_}`));
      } else {
        resolve(body);
      }
    });
  });
}

function getSessionInfo(model, sha) {
  fetch(model, sha).then((body) => {
    var state = body['Item']['State'];
    var startTime = body['Item']['StartTime'] ? new Date(body['Item']['StartTime']) : new Date();
    var endTime = body['Item']['EndTime'] ? new Date(body['Item']['EndTime']) : new Date();
    var queuePosition = body['Item']['QueuePosition'];
    var start = startTime.getTime();
    var end = endTime.getTime();
    var duration = moment(start).to(new Date(start + (start - end)), true);

    if (state === 'running') {
      console.log(`${state} (${duration})`);
    } else if (state === 'queued') {
      console.log(`${state} (${queuePosition})`);
    } else {
      console.log(`${state}`);
    }
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
      getSessionInfo(model, sha);
    });
  }
};
