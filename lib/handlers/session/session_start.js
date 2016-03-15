"use strict";

var exceptions = require('../../exceptions');
var config = require('../../config');
var utils = require('../../utils');

function startSession(model, sha) {
  let sha_ = sha.slice(0, 8);

  console.log(`Starting "${model.name}" at ${sha_}...`);
  utils.postJSON(config.host + config.session_start_endpoint, { model: model.name, sha: sha }, (err, res, body) => {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else if (res.statusCode !== 200) {
      err = exceptions.fromResponse(res, body);
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else {
      console.log(`Successfully started "${model.name}" at ${sha_}.`);
    }
  });
}

module.exports = function(sha) {
  let model = utils.readConfig();
  utils.getSha(sha).then(sha => startSession(model, sha)).catch(err => {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
};
