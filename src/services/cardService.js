'use strict';

const MAX_NUMBER_OF_CARDS = 16;
const cardsAvailableInDeck = [];

for(let i = 0; i < MAX_NUMBER_OF_CARDS; i++) {
  cardsAvailableInDeck.push(i);
}

function getRandomInt(minInt, maxInt) {
  const min = Math.ceil(minInt);
  const max = Math.floor(maxInt);
  return Math.floor(Math.random() * (max - min)) + min;
}


function retrieveRandomCard() {
  const randomNumber = getRandomInt(0, cardsAvailableInDeck.length);
  const cardRetrieved = cardsAvailableInDeck.splice(randomNumber, 1)[0];
  return cardRetrieved;
}

function retrieveCards(numberOfCards) {
  const cards = [];
  for(let i = 0; i < numberOfCards; i++) {
    cards.push(retrieveRandomCard());
  }

  return cards;
}

module.exports = {
  retrieveRandomCard,
  retrieveCards
};