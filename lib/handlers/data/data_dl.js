"use strict";

var mkdirp = require('mkdirp');
var path = require('path');
var read = require('read');
var zlib = require('zlib');
var fs = require('fs');

var exceptions = require('../../exceptions');
var config = require('../../config');
var utils = require('../../utils');

module.exports = function(key) {
  console.log(`This will download the dataset at "${key}" from Fomoro.`);
  console.log();
  console.log('\tThe folder "datasets/" will be created if it does not exist');
  console.log('\tand any existing datasets may be overwritten.');
  console.log();
  read({ prompt: 'Is this okay? (y/n)' }, (err, yn) => {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
      return;
    }

    if (yn.toLowerCase() === 'y') {
      mkdirp.sync('datasets/');

      var dataset_gz_path = `datasets/${key}.gz`;
      var dataset_path = `datasets/${key}`;

      var req = utils.postJSONDownload(config.host + config.data_download_endpoint, { key: key });

      console.log(`Downloading the dataset for "${key}"...`);
      utils.download(req, dataset_gz_path).then(() => {
        console.log(`Decompressing the dataset for "${key}"...`);
        return utils.deflate(dataset_gz_path, dataset_path);
      }).then(() => {
        fs.unlinkSync(dataset_gz_path); // Remove gzipped file
      }).catch((err) => {
        console.error(err.stack);
      });
    } else {
      console.log('Okay, did NOT change anything.');
    }
  });
};
