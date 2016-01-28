"use strict";

const mkdirp = require('mkdirp');
const path = require('path');
const read = require('read');
const fs = require('fs');
const os = require('os');

const exceptions = require('../exceptions');
const config = require('../config');

const fomoro_dir = path.join(os.homedir(), '.fomoro');

module.exports = function() {
  console.log('Logging in to Fomoro...');
  read({ prompt: 'Token: ', silent: true }, (err, token) => {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
      return;
    }

    let token_path = path.join(fomoro_dir, 'auth');
    console.log('Creating .fomoro directory:', fomoro_dir);
    mkdirp.sync(fomoro_dir);
    console.log('Writing token to ', token_path);
    fs.writeFileSync(token_path, JSON.stringify({ token: token }));
    console.log('Successfully logged in.');
  });
};
