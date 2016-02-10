var path = require('path');
var fs = require('fs');

var exceptions = require('../exceptions');
var compress = require('../compress');
var config = require('../config');
var upload = require('../upload');
var utils = require('../utils');

module.exports = function() {
  console.log('NOTE: Please ensure that all available fields are provided:');
  console.log('https://fomoro.gitbooks.io/guide/content/datasets.html');
  console.log();

  var data = JSON.parse(fs.readFileSync('config.json'));
  var key = utils.getKey(data.name, data.version);

  console.log(`Pushing "${key}" dataset...`);
  compress(data.file).then(function(fstream) {
    return upload(config.host + config.data_push_endpoint, data, fstream);
  }).then(function() {
    console.log(`Successfully pushed "${key}" dataset.`);
  }, function(err) {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
};
