"use strict";

class Exception extends Error {
  constructor(message) {
    super();
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor.name);
  }
}

class InvalidOpsException extends Exception {
  constructor(message, invalidOps) {
    super(message);
    this.invalidOps = invalidOps;
  }
}
exports.InvalidOpsException = InvalidOpsException;

class AuthException extends Exception {
  constructor(message) {
    super(message);
  }
}
exports.AuthException = AuthException;

class ResponseException extends Exception {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
exports.ResponseException = ResponseException;

var userMessages = {
  'InvalidOpsException': err => {
    var opMessages = err.invalidOps.forEach(op => `\tFailed to find ${op} in the graph.\n`);
    return `Found invalid operations in the model config:\n\n${opMessages}\nPlease make sure your model config includes valid graph operations.`;
  },
  'AuthException': err => {
    return 'Could not read auth token. Login first.';
  },
  'ResponseException': err => {
    return `The server returned an error:\n\n\t${err.message}\n\nVerify the request then let us know at team@fomoro.com`;
  }
};

exports.getUserMessage = function(err) {
  var userMessage = userMessages[err.name];
  if (userMessage) {
    return userMessage(err);
  } else {
    return `Something unexpected has happened:\n\n${err.stack}\n\nPlease let us know at team@fomoro.com`;
  }
};

exports.fromResponse = function(res, body) {
  var error = body.error;
  if (!error) {
    error = { message: 'unexpected exception' };
  }
  return new ResponseException(error.message, res.statusCode);
};
