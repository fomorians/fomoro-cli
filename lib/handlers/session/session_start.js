"use strict";

var exceptions = require('../../exceptions');
const sessions = require('../../sessions');
var config = require('../../config');
var utils = require('../../utils');

module.exports = function(sha, watch, follow) {
  let model = utils.readConfig();
  utils.getSha(sha).then(sha => sessions.startSession(model, sha, watch, follow)).catch(err => {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
};
