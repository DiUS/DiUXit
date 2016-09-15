const cardService = require('../src/services/cardService');

describe('cardService', () => {

  it('should return random cards without duplicates', () => {
    console.log(cardService.retrieveRandomCard());
    console.log(cardService.retrieveRandomCard());
    console.log(cardService.retrieveRandomCard());
    console.log(cardService.retrieveRandomCard());
    console.log(cardService.retrieveRandomCard());
    console.log(cardService.retrieveRandomCard());
    console.log(cardService.retrieveRandomCard());
    console.log(cardService.retrieveRandomCard());
    console.log(cardService.retrieveRandomCard());
    console.log(cardService.retrieveRandomCard());
    console.log(cardService.retrieveRandomCard());
    console.log(cardService.retrieveRandomCard());
    console.log(cardService.retrieveRandomCard());
    console.log(cardService.retrieveRandomCard());

  });

});