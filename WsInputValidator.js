'use strict';

let typeChecker = require('./TypeChecker')();

// validates incoming data from ws
function WsInputValidator() {

  // message is str reveiced from ws, should be json
  // returns { error } or { json }
  function tryGetJson(message) {

    if (!message || message === 'null') {
      return { error: 'Message is null' };
    }

    try {
        let json = JSON.parse(message);
        if (!typeChecker.isObject(json)) {
          return { error: 'Message is not object: ' + message };
        }
        return { json };
    }
    catch (e) {
        return { error: 'Error parsing message: ' + message };
    }
  }

  return {
    tryGetJson: tryGetJson
  };
}

module.exports = WsInputValidator;
