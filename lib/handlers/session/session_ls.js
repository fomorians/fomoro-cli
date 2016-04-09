"use strict";

const toml = require('toml');
const fs = require('fs');
const _ = require('lodash');

const exceptions = require('../../exceptions');
const config = require('../../config');
const utils = require('../../utils');

function listSessions(modelName) {
  utils.postJSON(config.host + config.session_list_endpoint, {}, function(err, res, body) {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else if (res.statusCode !== 200) {
      err = exceptions.fromResponse(res, body);
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else {
      var header = ['Session', 'State', 'Start', 'Duration'];
      var items = _.orderBy(body['Items'], 'StartTime', 'desc');
      if (modelName) {
        items = items.filter(session => {
          let sessionModelName = session['ModelId'].slice(session['Owner'].length + 1);
          return sessionModelName === modelName;
        });
      }
      items = items.map(session => utils.getSessionMessage(session));

      var table = utils.table(items, header);
      console.log(table.toString());
    }
  });
}

module.exports = function(showAll) {
  if (showAll) {
    listSessions();
    return;
  }

  try {
    let model = toml.parse(fs.readFileSync('fomoro.toml'));
    listSessions(model.name);
  } catch (err) {
    listSessions();
  }
};
