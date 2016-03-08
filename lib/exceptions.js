"use strict";

var _ = require('lodash');

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

class EmailVerificationException extends Exception {
  constructor(message) {
    super(message);
  }
}
exports.EmailVerificationException = EmailVerificationException;

class ExistsException extends Exception {
  constructor(message) {
    super(message);
  }
}
exports.ExistsException = ExistsException;

class NotFoundException extends Exception {
  constructor(message) {
    super(message);
  }
}
exports.NotFoundException = NotFoundException;

class ValidationException extends Exception {
  constructor(message, results) {
    super(message);
    this.results = results;
  }
}
exports.ValidationException = ValidationException;

var userMessages = {
  'InvalidOpsException': err => {
    var messages = err.invalidOps.map(op => `\tFailed to find ${op} in the graph.`).join('\n');
    return `Found invalid operations in the model config:\n\n${messages}\n\nMake sure your model config includes valid graph operations.`;
  },
  'ValidationException': err => {
    var messages = _.map(err.results, (message, key) => '\t' + message).join('\n');
    return `Config failed validation:\n\n${messages}\n\nMake sure your config is correct.`;
  },
  'AuthException': err => {
    return `Failed to authenticate: ${err.message}`;
  },
  'EmailVerificationException': err => {
    return `Please verify your email address: ${err.message}`;
  },
  'NotFoundException': err => {
    return `Resource not found: ${err.message}`;
  },
  'ExistsException': err => {
    return `Resource already exists: ${err.message}`;
  },
  'Exception': err => {
    return `${err.stack}\n\nPlease let us know at team@fomoro.com`;
  }
};

exports.getUserMessage = function(err) {
  var userMessage = userMessages[err.name];
  if (userMessage) {
    return userMessage(err);
  } else {
    return err.stack;
  }
};

exports.fromResponse = function(res, body) {
  if (!body.error) {
    return new Exception('unknown exception');
  }
  switch (body.error.type) {
    case 'AuthException':
      return new AuthException(body.error.message);
    case 'ValidationException':
      return new ValidationException(body.error.message, body.error.results);
    case 'EmailVerificationException':
      return new EmailVerificationException(body.error.message);
    case 'ExistsException':
      return new ExistsException(body.error.message);
    case 'NotFoundException':
      return new NotFoundException(body.error.message);
    default:
      return new Exception(body.error.message);
  }
};
