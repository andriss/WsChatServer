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

let wsInputValidator = require('./WsInputValidator')();
let wsSendWrapper = require('./WsSendWrapper')(logger);

logger.info({ type: 'srv', subType: 'start', text: 'Server started' });

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

    wsSendWrapper.wrap(ws); // overrides default ws.send to log errors

    ws._sender.userName = userName;
    ws._sender.lastActivityDate = new Date();
    ws.send(JSON.stringify({ type: 'srv', subType: 'connect-succ' })); // says to specific client, that he is successfully connected

    let msg = 'User ' + userName + ' has connected!';
    wss.broadcast(JSON.stringify({ type: 'srv', text: msg }));
    logger.info({ type: 'srv', subType: 'connect-succ', userName: userName });
  }

  ws.on('message', function(message) {

    let userName = ws._sender.userName;
    let res = wsInputValidator.tryGetJson(message);

    if (res.error) {
      logger.warn({ error: res.error, userName: userName });
      return;
    }

    let msg = res.json;

    if (msg.type === 'leave') {
      wss.broadcast(JSON.stringify({ type: 'srv', text: 'user ' + userName + ' left the chat!' }));
      ws.close();
    }
    else {
      ws._sender.lastActivityDate = new Date();
      let msgStr = JSON.stringify({ type: 'chat', text: msg.text, userName: userName });
      wss.broadcast(msgStr);
      logger.info({ type: 'chat', text: msg.text, userName: userName });
    }
  });

  ws.on('close', function close() {
    let userName = ws._sender.userName;
    logger.info({ type: 'close', text: 'User ' + userName + ' disconnected', userName: userName });
  });

});
