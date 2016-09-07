'use strict';

let config = require('./config.js');

let WebSocketServer = require('ws').Server;
let wss = new WebSocketServer({ port: config.wsPort });

let logger = require('./logger');
let exitHandler = require('./ExitHandler.js')(wss, logger);
exitHandler.init();

let inactivityKicker = require('./InactivityKicker')();
inactivityKicker.watch(wss, config.inactivityTimeoutMs);

let userNameValidator = require('./UserNameValidator')(wss);
let userNameExtractor = require('./userNameExtractor')(wss);



logger.info('Server started');

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    // because it seems like client is not removed (immediately) from wss.clients list after ws.close();
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
};

wss.on('connection', function(ws) {

  let userName = userNameExtractor.get(ws);

  if (!userNameValidator.isUserNameValid(userName)) {
    ws.send(JSON.stringify({ type: 'srv', subType: 'connect-fail', text: 'userName ' + userName + ' is incorrect or already exists!'}));
    ws.close();
    return;
  }
  else {
    ws._sender.userName = userName;
    ws._sender.lastActivityDate = new Date();
    ws.send(JSON.stringify({ type: 'srv', subType: 'connect-succ' })); // says to specific client, that he is successfully connected

    let msg = 'User ' + userName + ' has connected!';
    wss.broadcast(JSON.stringify({ type: 'srv', text: msg }));
    logger.info(msg);
  }

  ws.on('message', function(message) {

    let msg = JSON.parse(message);
    let userName = ws._sender.userName;

    if (msg.type === 'leave') {
      wss.broadcast(JSON.stringify({ type: 'srv', text: 'user ' + userName + ' left the chat!' }));
      ws.close();
    }
    else {
      ws._sender.lastActivityDate = new Date();
      let msgStr = JSON.stringify({ type: 'chat', text: msg.text, userName: ws._sender.userName });
      wss.broadcast(msgStr);
      logger.info({ type: 'chat', text: msg.text, userName: ws._sender.userName });
    }
  });

  ws.on('close', function close() {
    let userName = ws._sender.userName;
    logger.info('User ' + userName + ' disconnected');
  });

});
