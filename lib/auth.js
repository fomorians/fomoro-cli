var path = require('path');
var fs = require('fs');
var os = require('os');

exports.getToken = function() {
  try {
    var auth_path = path.join(os.homedir(), '.fomoro', 'auth');
    var auth = JSON.parse(fs.readFileSync(auth_path));
    return auth.token;
  } catch (err) {
    console.error('Could not read token. Login first.');
    return null;
  }
};
