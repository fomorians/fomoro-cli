"use strict";

var mkdirp = require('mkdirp');
var path = require('path');
var read = require('read');
var zlib = require('zlib');
var fs = require('fs');

var exceptions = require('../../../exceptions');
var config = require('../../../config');
var utils = require('../../../utils');

function downloadArtifact(model, sha) {
  let sha_ = sha.slice(0, 8);
  let filename = `checkpoint_${sha_}.tar.gz`;

  console.log(`This will download checkpoint artifacts for "${model.name}" at ${sha_}.`);
  console.log();
  console.log(`\tThe file "${filename}" will be created if it does not exist`);
  console.log('\tand may be overwritten if it already exists.');
  console.log();
  read({ prompt: 'Is this okay? (y/n)' }, (err, yn) => {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
      return;
    }

    if (yn.toLowerCase() === 'y') {
      console.log(`Downloading artifact for "${model.name}" at ${sha_}...`);

      var stream = fs.createWriteStream(filename);
      var req = utils.postJSONDownload(config.host + config.session_download_checkpoint_endpoint, {
        model: model.name,
        sha: sha
      });

      utils.download(req, filename).then(() => {
        console.log(`Successfully downloaded artifact for "${model.name}" at ${sha_}.`);
      }, (err) => {
        console.error(err.stack);
      });
    } else {
      console.log('Okay, did NOT change anything.');
    }
  });
}

module.exports = function(sha) {
  let model = utils.readConfig();
  utils.getSha(sha).then(sha => downloadArtifact(model, sha)).catch(err => {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
};
