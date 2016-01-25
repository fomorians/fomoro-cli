var fs = require('fs');
var path = require('path');
var config = require('../config');
var utils = require('../utils');
var upload = require("../upload");
var compress = require("../compress");
var validation = require("../validation");
var exceptions = require('../exceptions');

module.exports = function() {
  var model = JSON.parse(fs.readFileSync('config.json'));

  try {
    validation.validateModel(model);
  } catch (err) {
    if (err instanceof exceptions.InvalidOpsException) {
      console.error('Found invalid operations in the model config:');
      console.error();
      err.invalidOps.forEach(op => console.error(`\tFailed to find ${op} in the graph.`));
      console.error();
      console.error('Please make sure your model config includes valid graph operations.');
    } else {
      console.error(err.stack);
    }
    process.exit(1);
  }

  compress(model.file).then(function(fstream) {
    return upload(config.host + config.model_push_endpoint, model, fstream);
  }).then(function(body) {
    console.log(body);
  }, function(err) {
    console.error(err.stack);
    process.exit(1);
  });
};
