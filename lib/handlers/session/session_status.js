"use strict";

var exceptions = require('../../exceptions');
var config = require('../../config');
var utils = require('../../utils');

function getSessionInfo(model, sha) {
  utils.fetchSession(model, sha).then(session => {
    var item = utils.getSessionMessage(session);
    var table = utils.table([item], ['Session', 'State', 'Duration']);
    console.log(table.toString());
  }).catch(err => {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
}

module.exports = function(sha) {
  let modelName = utils.getModelName(sha);
  utils.getSha(sha).then(sha => getSessionInfo(modelName, sha)).catch(err => {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
};
