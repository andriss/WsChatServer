'use strict';

// watches users and kicks inactive ones

function InactivityKicker() {

  function watch(wss, inactivityTimeoutMs) {

    // http://stackoverflow.com/questions/21097421/what-is-the-reason-javascript-settimeout-is-so-inaccurate
    let tolerance = 50; // little tolerance to address inaccuracy in javascripts setInterval

    setInterval(function() {
      let now = new Date();
      wss.clients.forEach(function each(ws) {
        let lastActivityDate = ws._sender.lastActivityDate;
        if (lastActivityDate && now - lastActivityDate.getTime() > inactivityTimeoutMs - tolerance) {
          wss.broadcast(JSON.stringify({ type: 'srv', text: 'user ' + ws._sender.userName + ' was disconected due to inactivity!' })); // inform all
          ws.send(JSON.stringify({ type: 'srv', subType: 'kick', text: 'Kicked due to inactivity!' })); // kick speficic user
          ws.close();
        }
      });
    }, inactivityTimeoutMs);
  }

  return {
    watch: watch
  };
}

module.exports = InactivityKicker;
