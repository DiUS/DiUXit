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
let cardsSubmittedForTheRound = [];
let playerCardsReceived = 0;
let playersVotesReceived = 0;
let playersVotes = [];

const CARDS_PER_PLAYER = 7;


let state = 'waiting';
const MIN_USERS = 2;
const MAX_USERS = 10;

const serverPort = process.env.PORT || 3000;

console.log(`Starting server on port ${serverPort}`);

server.listen(serverPort);

app.use('/static', express.static(__dirname + '/static'));
app.use('/assets', express.static(__dirname + '/assets'));

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

function resetState() {
  cardService.resetDeck();

  storyTeller = null;
  storyTellersCard = null;
  cardsSubmittedForTheRound = [];
  playerCardsReceived = 0;
  playersVotesReceived = 0;
  playersVotes = [];
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
    resetState();
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
    cardsSubmittedForTheRound.push({
      username: socket.username,
      cardId,
      isStoryTeller: true,
      votesReceived: []
    });
    sendToCommunity(eventTypes.PLAYER_CARD, '');
    console.log(`story teller's card is: ${cardId}`);
    progressToVotingIfAllCardsReceived();
  });

  // Receiving non story teller's card
  socket.on('PLAYER_CARD', (cardId) => {
    playerCardsReceived++;
    cardsSubmittedForTheRound.push({
      username: socket.username,
      cardId,
      isStoryTeller: false,
      votesReceived: []
    });
    sendToCommunity(eventTypes.PLAYER_CARD, '');
    progressToVotingIfAllCardsReceived();
  });

  socket.on('PLAYERS_VOTE', playersVote => {
    playersVotesReceived++;
    const lowercasedVote = playersVote.toLowerCase();
    const votedCard = cardsSubmittedForTheRound[(lowercasedVote.charCodeAt(0) - 97)];
    votedCard.votesReceived.push(socket.username);

    if (playersVotesReceived + 1 >= users.length) {
      const votingResults = initializeVoteResults();

      const storyTellersCard = cardsSubmittedForTheRound.filter(c => c.isStoryTeller);
      const isAllOrNothing = (storyTellersCard.votesReceived.length == users.length - 1) || (storyTellersCard.votesReceived.length == 0);

      // Find story teller's card
      // If no one or everyone voted for it assign points
      // If some but not all people voted for it assign points
      // assign points for every card every other player voted for

      for(let i = 0; i < cardsSubmittedForTheRound; i++ ) {
        const cardInfo = cardsSubmittedForTheRound[i];

        if (card.votesReceived.length > 0) {
          const cardLetter = String.fromCharCode(97 + i);
          votingResults[cardLetter]
        }
      }

      io.sockets.emit('VOTING_RESULTS', votingResults);
    }
  });

  function progressToVotingIfAllCardsReceived() {

    if(playerCardsReceived >= users.length) {
      rngService.randomizeArray(cardsSubmittedForTheRound);
      const cardsOnlyArray = extractCardIdsOnly(cardsSubmittedForTheRound);
      sendToCommunity(eventTypes.REVEAL_CARDS, cardsOnlyArray);
      io.sockets.emit(eventTypes.ENABLE_VOTING, '');

      console.log(`cardsSubmittedForTheRound ${JSON.stringify(cardsSubmittedForTheRound)}`);
    }
  }

  function extractCardIdsOnly(cardsForRound) {
    return cardsForRound.map(obj => obj.cardId);
  }

  function initializeVoteResults() {
    const results = {};

    for(let i = 0; i < users.length; i++) {
      results[String.fromCharCode(97 + i)] = [];
    }

    return results;
  }

});
