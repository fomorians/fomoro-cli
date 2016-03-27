"use strict";

const exceptions = require('../../exceptions');
const sessions = require('../../sessions');
const config = require('../../config');
const utils = require('../../utils');

module.exports = function(sha) {
  let model = utils.readConfig();
  let modelName = model.name;
  utils.getSha(sha).then(sha => sessions.pollSessionInfo(modelName, sha)).catch(err => {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
};
