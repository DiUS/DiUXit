'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const eventTypes = require('./messageTypes');
const cardService = require('./services/cardService');
const rngService = require('./services/rngService');


const users = [];
const connections = [];
const communityConnections = [];

let storyTeller = null;
let storyTellersCard = null;
let playerCardsReceived = 0;

const CARDS_PER_PLAYER = 3;


let state = 'waiting';
const MIN_USERS = 2;
const MAX_USERS = 10;

const serverPort = process.env.PORT || 3000;

console.log(`Starting server on port ${serverPort}`);

server.listen(serverPort);

app.use('/static', express.static(__dirname + '/static'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/community', (req, res) => {
  res.sendFile(__dirname + '/community.html');
});

function getUserConnections() {
  return connections.filter(conn => conn.username);
}

function getCommunityConnections() {
  return connections.filter(conn => !conn.username);
}

function sendToCommunity(eventType, payload) {
  for(const conn of getCommunityConnections()) {
    conn.emit(eventType, payload);
  }
}

io.sockets.on('connection', socket => {
  connections.push(socket);
  console.log(`Connected: ${connections.length} sockets connected`);

  // Disconnect
  socket.on('disconnect', () => {
    users.splice(users.indexOf(socket.username), 1);
    connections.splice(connections.indexOf(socket), 1);
    console.log(`Disconnect: ${connections.length} sockets connected`);
  });

  // Send Message
  socket.on('send message', data => {
    io.sockets.emit('new message', {msg: data, user: socket.username});
  });

  // New User
  socket.on('new user', (data, callback) => {
    callback(true);
    socket.username = data;
    users.push(socket.username);
    updateUsernames();
  });

  function updateUsernames() {
    io.sockets.emit('get users', users);
  }

  // Start game
  socket.on('start game', () => {
    cardService.resetDeck();
    const numberOfUsers = users.length;
    console.log('Game starting with', numberOfUsers, 'players');
    if (numberOfUsers >= MIN_USERS && numberOfUsers <= MAX_USERS) {

      for(const conn of getUserConnections()) {
        const playersCards = cardService.retrieveCards(CARDS_PER_PLAYER);
        conn.emit(eventTypes.DISTRIBUTING_CARDS, {user: 'server', msg: playersCards});
      }

      // Broadcast the story teller
      storyTeller = users[rngService.getRandomInt(0, users.length)];
      io.sockets.emit(eventTypes.STORY_TELLER_IS, storyTeller);
      console.log(`storyTeller is : ${storyTeller}`);
    }
  });

  // Receiving story teller's card
  socket.on('STORY_TELLERS_CARD', (cardId) => {
    playerCardsReceived++;
    storyTellersCard = cardId;
    sendToCommunity(eventTypes.PLAYER_CARD, cardId);
  });

  // Receiving non story teller's card
  socket.on('PLAYER_CARD', (cardId) => {
    playerCardsReceived++;
    sendToCommunity(eventTypes.PLAYER_CARD, cardId);

    if(playerCardsReceived >= users.length) {
      sendToCommunity(eventTypes.REVEAL_CARDS, '');
      io.sockets.emit(eventTypes.ENABLE_VOTING, '');
    }
  });

});

