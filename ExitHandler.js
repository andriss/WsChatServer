'use strict';

// gracefully handles process exit

function ExitHandler(wss, logger) {

  function init() {

    // http://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
    process.stdin.resume(); // so the program will not close instantly

    // catches ctrl+c event
    process.on('SIGINT', handle.bind(null, {exit:true}));

    // catches SIGTERM signal
    process.on('SIGTERM', handle.bind(null, {exit:true}));

    // catches uncaught exceptions
    process.on('uncaughtException', handle.bind(null, {exit:true}));
  }

  function handle(options, err) {

      logger.info('Server is going down');

      wss.broadcast(JSON.stringify({ type: 'srv', subType: 'down', text: 'Server is going down' }));
      wss.clients.forEach(function each(ws) {
        ws.close();
      });

      if (err) {
        logger.error(err.stack);
      }

      console.log('Finishing tasks, exit in 2s');

      // seems that ws.send is async and needs some time to complete
      // otherwise (without timeout), messages are not sent
      setTimeout(function() {
        if (options.exit) {
          process.exit();
        }
      }, 2000);

  }

  return {
    init: init
  };
}

module.exports = ExitHandler;
