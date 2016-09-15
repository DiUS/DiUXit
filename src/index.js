'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const users = [];
const connections = [];
const cardsUsed = [];


let state = 'waiting';
const minUsers = 5;
const maxUsers = 10;

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
    const numberOfUsers = users.length;
    console.log('game started', numberOfUsers);
    //if (numberOfUsers >= minUsers && numberOfUsers <= maxUsers) {
      // start game
      io.sockets.emit('new message', {msg: [1,2,3,4,5,7], user: 'Narrator'});
    //}

    //distribute cards
    //

  });
});



function retrieveRandomCard() {

  const cardDistribution = [];




  return cardDistribution;
}
