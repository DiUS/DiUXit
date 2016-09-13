'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const users = [];
const connections = [];

console.log('Server running');

server.listen(process.env.PORT || 3000);

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
});
