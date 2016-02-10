var path = require('path');
var fs = require('fs');

var exceptions = require('../exceptions');
var validation = require("../validation");
var compress = require("../compress");
var config = require('../config');
var upload = require("../upload");
var utils = require('../utils');

module.exports = function() {
  var model = JSON.parse(fs.readFileSync('config.json'));
  var key = utils.getKey(model.name, model.version);

  console.log(`Validating "${key}" model...`);
  try {
    validation.validateModel(model);
  } catch (err) {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
    return;
  }

  console.log(`Pushing "${key}" model...`);
  compress(model.file).then(function(fstream) {
    return upload(config.host + config.model_push_endpoint, model, fstream);
  }).then(function() {
    console.log(`Successfully pushed "${key}" model.`);
  }, function(err) {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
};
