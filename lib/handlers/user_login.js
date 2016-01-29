"use strict";

const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');
const os = require('os');

const exceptions = require('../exceptions');
const config = require('../config');
const utils = require('../utils');

const fomoro_dir = path.join(os.homedir(), '.fomoro');
const auth_path = path.join(fomoro_dir, 'auth');

module.exports = function() {
  utils.read('\tEmail: ').then(email => {
    return utils.read('\tPassword: ', true).then(password => {
      console.log('Logging into Fomoro...');
      utils.postAnonJSON(config.host + config.login_endpoint, { email: email, password: password }, (err, res, body) => {
        if (err) {
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else if (res.statusCode !== 200) {
          err = exceptions.fromResponse(res, body);
          console.error(exceptions.getUserMessage(err));
          process.exit(1);
        } else {
          mkdirp.sync(fomoro_dir);
          fs.writeFileSync(auth_path, JSON.stringify({ token: body.id_token }));
          console.log('Successfully logged in.');
        }
      });
    });
  }).catch(err => {
    console.error(exceptions.getUserMessage(err));
    process.exit(1);
  });
};
