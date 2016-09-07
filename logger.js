'use strict';

// creates bunyan logger instance

let bunyan = require('bunyan');

module.exports = bunyan.createLogger({
  name: "myapp",
  streams: [
    {
      level: 'info',
      stream: process.stdout            // log INFO and above to stdout
    },
    {
      level: 'info',
      path: 'log.log'  // log ERROR and above to a file
    }
]});
