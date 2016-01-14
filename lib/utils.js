var request = require('request');

exports.getKey = function(name, version) {
  return [name, version].join('@');
};

exports.logResponse = function(err, res, body) {
  if (err) {
    console.error('Command failed.');
    console.error(err.stack);
    process.exit(1);
  } else if (res.statusCode !== 200) {
    console.error('Request failed.');
    console.error(body);
    process.exit(1);
  } else {
    console.log('Success!');
    console.log(body);
  }
};

exports.postJSON = function(uri, json, callback) {
  return request({
    uri: uri,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(json)
  }, callback);
}
