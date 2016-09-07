'use strict';

// validates userName for:
// * existing
// * empty

function UserNameValidator(wss) {
  function isUserNameValid(userName) {

    if (!userName) {
      return false;
    }

    for (let i=0 ;i<wss.clients.length; i++) {
      if (wss.clients[i]._sender.userName === userName) {
        return false;
      }
    }
    return true;
  }

  return {
    isUserNameValid: isUserNameValid
  };
}

module.exports = UserNameValidator;
