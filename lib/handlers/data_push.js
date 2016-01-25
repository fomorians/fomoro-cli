var fs = require('fs');
var path = require('path');
var config = require('../config');
var utils = require('../utils');
var upload = require("../upload");
var compress = require("../compress");

module.exports = function() {
  console.log('NOTE: Please ensure that all available fields are provided:');
  console.log('https://fomoro.gitbooks.io/guide/content/datasets.html');

  var data = JSON.parse(fs.readFileSync('config.json'));

  compress(data.file).then(function(fstream) {
    return upload(config.host + config.data_push_endpoint, data, fstream);
  }).then(function(body) {
    console.log('Success!');
    console.log(body);
  }, function(err) {
    console.error('Command failed.');
    console.error(err.stack);
    process.exit(1);
  });
};
