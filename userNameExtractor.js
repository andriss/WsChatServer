'use strict';

// extracts userName from queryString

function userNameExtractor() {

  function get(ws) {
    let userName = ws.upgradeReq.url;
    if (userName.indexOf('/?') === 0) {
      userName = userName.substring(2, userName.length);
    }
    // because it is basically a queryString
    return decodeURI(userName);
  }

  return {
    get: get
  };
}

module.exports = userNameExtractor;
