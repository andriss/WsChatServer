'use strict';

// wraps/overrides ws.send() to automatically log errors
function WsSendWrapper(logger) {

  function wrap(ws) {

    (function (original) {
      ws.send = function (data) {
          original.call(this, data, function ack(error) {
            if (error) {
              logger.error(error);
            }
          });
      };
    }(ws.send));
  }

  return {
    wrap: wrap
  };
}

module.exports = WsSendWrapper;
