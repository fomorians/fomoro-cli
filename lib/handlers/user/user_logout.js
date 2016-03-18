"use strict";

const path = require('path');
const fs = require('fs');
const os = require('os');

const fomoro_dir = path.join(os.homedir(), '.fomoro');
const auth_path = path.join(fomoro_dir, 'auth');

module.exports = function() {
  console.log('Logging out of Fomoro...');
  try {
    fs.unlinkSync(auth_path);
    console.log('Successfully logged out.');
  } catch (err) {
    console.log('Could not log out:', err.message);
  }
};
