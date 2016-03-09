"use strict";

var mkdirp = require('mkdirp');
var path = require('path');
var read = require('read');
var zlib = require('zlib');
var fs = require('fs');

var Git = require('nodegit');

var exceptions = require('../exceptions');
var config = require('../config');
var utils = require('../utils');

function pullArtifact(model, sha) {
  let sha_ = sha.slice(0, 8);

  console.log(`This will pull summaries for "${model.name}" at ${sha_}.`);
  console.log();
  console.log('\tThe folder "summaries/" will be created if it does not exist');
  console.log('\tand any existing summaries may be overwritten.');
  console.log();
  read({ prompt: 'Is this okay? (y/n)' }, (err, yn) => {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
      return;
    }

    if (yn.toLowerCase() === 'y') {
      console.log(`Pulling summaries for "${model.name}" at ${sha_}...`);

      mkdirp.sync('summaries/');
      var summary_stream = fs.createWriteStream(`summaries/${sha_}.tar.gz`);

      var req = utils.postJSON(config.host + config.summary_pull_endpoint, { model: model.name, sha: sha }, function(err, res, body) {
        if (err) {
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else if (res.statusCode !== 200) {
          err = exceptions.fromResponse(res, body);
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else {
          console.log(`Successfully pulled summaries for "${model.name}" at ${sha_}.`);
        }
      });

      var gunzip = zlib.createGunzip();
      req.pipe(gunzip).pipe(summary_stream);
    } else {
      console.log('Okay, did NOT change anything.');
    }
  });
}

module.exports = function(sha) {
  let model = utils.readConfig();
  if (sha) {
    pullArtifact(model, sha);
  } else {
    Git.Repository.open('.').then(repo => repo.getHeadCommit()).then(commit => {
      let sha = commit.toString();
      pullArtifact(model, sha);
    });
  }
};
