'use strict';

const cardService = require('../src/services/cardService');

describe('cardService', () => {

  it.only('should retrieve random cards asked for', () => {
    let cards = cardService.retrieveCards(3).sort();
    console.log(cards);

    cards = cardService.retrieveCards(3).sort();
    console.log(cards);

    cards = cardService.retrieveCards(3).sort();
    console.log(cards);

    cards = cardService.retrieveCards(3).sort();
    console.log(cards);

    cards = cardService.retrieveCards(3).sort();
    console.log(cards);
  });

});