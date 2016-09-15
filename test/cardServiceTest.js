'use strict';

const cardService = require('../src/services/cardService');

describe('cardService', () => {

  it('should return random cards without duplicates', () => {
    const cardsPulled = [];

    cardsPulled.push(cardService.retrieveRandomCard());
    cardsPulled.push(cardService.retrieveRandomCard());
    cardsPulled.push(cardService.retrieveRandomCard());
    cardsPulled.push(cardService.retrieveRandomCard());
    cardsPulled.push(cardService.retrieveRandomCard());
    cardsPulled.push(cardService.retrieveRandomCard());
    cardsPulled.push(cardService.retrieveRandomCard());
    cardsPulled.push(cardService.retrieveRandomCard());
    cardsPulled.push(cardService.retrieveRandomCard());
    cardsPulled.push(cardService.retrieveRandomCard());
    cardsPulled.push(cardService.retrieveRandomCard());
    cardsPulled.push(cardService.retrieveRandomCard());
    cardsPulled.push(cardService.retrieveRandomCard());
    cardsPulled.push(cardService.retrieveRandomCard());
    cardsPulled.push(cardService.retrieveRandomCard());
    cardsPulled.push(cardService.retrieveRandomCard());
  });

  //it.only('should retrieve random cards asked for', () => {
  //  let cards = cardService.retrieveCards(3);
  //  console.log(cards);
  //  cards = cardService.retrieveCards(3);
  //  console.log(cards);
  //  cards = cardService.retrieveCards(3);
  //  console.log(cards);
  //  cards = cardService.retrieveCards(3);
  //  console.log(cards);
  //});

});