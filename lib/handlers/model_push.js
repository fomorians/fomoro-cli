var fs = require('fs');
var path = require('path');
var config = require('../../config.json');
var utils = require('../utils');

module.exports = function() {
  var model = JSON.parse(fs.readFileSync('config.json'));
  var key = utils.getKey(model.name, model.version);
  console.log("Push a model", model, key);
};
