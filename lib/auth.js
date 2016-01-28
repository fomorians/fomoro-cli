var fs = require('fs');
var os = require('os');
var path = require('path');

var exceptions = require('./exceptions');

exports.getToken = function() {
  try {
    var auth_path = path.join(os.homedir(), '.fomoro', 'auth');
    var auth = JSON.parse(fs.readFileSync(auth_path));
    return auth.token;
  } catch (err) {
    throw new exceptions.AuthException(err.message);
  }
};
