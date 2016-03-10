"use strict";

var mkdirp = require('mkdirp');
var path = require('path');
var read = require('read');
var zlib = require('zlib');
var fs = require('fs');

var Git = require('nodegit');

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

      var req = utils.postJSON(config.host + config.session_download_checkpoint_endpoint, { model: model.name, sha: sha }, function(err, res, body) {
        if (err) {
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else if (res.statusCode !== 200) {
          err = exceptions.fromResponse(res, body);
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else {
          console.log(`Successfully downloaded artifact for "${model.name}" at ${sha_}.`);
        }
      });

      var gunzip = zlib.createGunzip();
      req.pipe(gunzip).pipe(stream);
    } else {
      console.log('Okay, did NOT change anything.');
    }
  });
}

module.exports = function(sha) {
  let model = utils.readConfig();
  if (sha) {
    downloadArtifact(model, sha);
  } else {
    Git.Repository.open('.').then(repo => repo.getHeadCommit()).then(commit => {
      let sha = commit.toString();
      downloadArtifact(model, sha);
    });
  }
};
