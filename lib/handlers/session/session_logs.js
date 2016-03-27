"use strict";

const exceptions = require('../../exceptions');
const sessions = require('../../sessions');
const config = require('../../config');
const utils = require('../../utils');

module.exports = function(sha, num, follow) {
  let modelName = utils.getModelName(sha);
  utils.getSha(sha).then(sha => sessions.getNextSessionLogs(modelName, sha, num, follow)).catch(err => {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
};
