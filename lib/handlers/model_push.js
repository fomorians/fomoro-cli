var fs = require('fs');
var path = require('path');
var config = require('../config');
var utils = require('../utils');
var upload = require("../upload");
var compress = require("../compress");

module.exports = function() {
  var model = JSON.parse(fs.readFileSync('config.json'));

  compress(model.file).then(function(fstream) {
    return upload(config.host + config.model_push_endpoint, model, fstream);
  }).then(function(body) {
    console.log('Success!');
    console.log(body);
  }, function(err) {
    console.error('Command failed.');
    console.error(err.stack);
    process.exit(1);
  });
};
