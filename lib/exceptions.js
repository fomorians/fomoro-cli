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
