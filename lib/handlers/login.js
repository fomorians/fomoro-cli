"use strict";

const read = require('read');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const os = require('os');
const config = require('../config');

const fomoro_dir = path.join(os.homedir(), '.fomoro');

module.exports = function() {
  read({ prompt: 'Token: ', silent: true }, (err, token) => {
    let token_path = path.join(fomoro_dir, 'auth');
    console.log('Creating .fomoro directory:', fomoro_dir);
    mkdirp.sync(fomoro_dir);
    console.log('Writing token to ', token_path);
    fs.writeFileSync(token_path, JSON.stringify({ token: token }));
  });
};
