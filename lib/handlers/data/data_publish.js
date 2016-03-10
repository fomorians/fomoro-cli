var path = require('path');
var fs = require('fs');

var exceptions = require('../../exceptions');
var compress = require('../../compress');
var config = require('../../config');
var upload = require('../../upload');
var utils = require('../../utils');

module.exports = function() {
  var dataset = utils.readConfig();
  var key = `${dataset.name}@${dataset.version}`;

  console.log(`Pushing "${key}" dataset...`);
  compress(dataset.file).then(function(fstream) {
    return upload(config.host + config.data_push_endpoint, dataset, fstream);
  }).then(function() {
    console.log(`Successfully pushed "${key}" dataset.`);
  }, function(err) {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
};
