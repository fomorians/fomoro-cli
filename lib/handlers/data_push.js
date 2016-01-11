var fs = require('fs');
var path = require('path');
var config = require('../../config.json');
var utils = require('../utils');

module.exports = function() {
  var data = JSON.parse(fs.readFileSync('config.json'));
  var key = utils.getKey(data.name, data.version);
  console.log("Push data", dataset, key);
};
