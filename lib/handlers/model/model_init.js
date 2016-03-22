'use strict';

const fs = require('fs');
const path = require('path');
const read = require('read');
const json2toml = require('json2toml');

const exceptions = require('../../exceptions');
const config = require('../../config');
const utils = require('../../utils');

module.exports = function() {
  console.log('This utility will walk you through creating a fomoro.toml file.');

  try {
    // Check if config already exists
    let stat = fs.lstatSync('fomoro.toml');
    if (stat.isFile()) {
      console.error('Cannot create fomoro.toml since it already exists.');
      process.exit(1);
    }
  } catch (err) {}

  let cwd = process.cwd();
  let default_name = path.basename(cwd);
  utils.read(`Name: (${default_name})`).then(name => {
    return utils.getRemotes().then(default_repo => {
      return utils.read(default_repo ? `Repository: (${default_repo})` : 'Repository:').then(repo => {
        let default_environment = 'tensorflow';
        return utils.read(`Environment: (${default_environment})`).then(environment => {
          return utils.read('Description:').then(description => {
            let dest = path.join(cwd, 'fomoro.toml');
            let toml_str = json2toml({
              name: name || default_name,
              repo: repo || default_repo,
              description: description,
              environment: environment || default_environment
            });

            console.log(`About to write to "${dest}":`);
            console.log();
            console.log(toml_str);

            read({ prompt: 'Is this okay? (y/n)' }, (err, yn) => {
              if (err) {
                console.error(exceptions.getUserMessage(err));
                process.exit(1);
                return;
              }

              if (yn.toLowerCase() === 'y') {
                fs.writeFileSync(dest, toml_str);
                console.log('Done.');
              } else {
                console.log(`Okay, did NOT write "${dest}".`);
              }
            });
          });
        });
      });
    });
  }).catch(err => {
    console.error(err.message);
    process.exit(1);
  });
};
