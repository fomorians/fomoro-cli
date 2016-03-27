"use strict";

var read = require('read');

var exceptions = require('../../exceptions');
var config = require('../../config');
var utils = require('../../utils');

function stopSession(modelName, sha) {
  let sha_ = sha.slice(0, 8);

  console.log(`This will stop the training session for "${modelName}" at ${sha_}.`);
  read({ prompt: 'Is this okay? (y/n)' }, (err, yn) => {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
      return;
    }

    if (yn.toLowerCase() === 'y') {
      console.log(`Stopping "${modelName}" at ${sha_}...`);
      utils.postJSON(config.host + config.session_stop_endpoint, { model: modelName, sha: sha }, (err, res, body) => {
        if (err) {
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else if (res.statusCode !== 200) {
          err = exceptions.fromResponse(res, body);
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else {
          console.log(`Successfully stopped "${modelName}" at ${sha_}.`);
        }
      });
    } else {
      console.log(`Okay, did NOT stop "${modelName}" at ${sha_}.`);
    }
  });
}

module.exports = function(sha) {
  let model = utils.readConfig();
  let modelName = model.name;
  utils.getSha(sha).then(sha => stopSession(modelName, sha)).catch(err => {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
};
