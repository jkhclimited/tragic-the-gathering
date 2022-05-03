var express = require('express');
var router = express.Router();
const request = require('request');
const cardsCtrl = require('../controllers/cards');
const decksCtrl = require('../controllers/decks');
const modDeckCtrl = require('../controllers/moddeck');

router.get('/', function(req, res){
  res.redirect('/home');
})
router.get('/home', cardsCtrl.index); // Front page.
router.get('/home/search', cardsCtrl.indexSearch); // Searches for a card inside that view.
router.get('/card/:id', isLoggedIn, cardsCtrl.showCard); // Shows a specific card's details.

router.get('/deckbox', isLoggedIn, cardsCtrl.boxShow); // Gets list of cards.
router.get('/deckbox/search', isLoggedIn, cardsCtrl.boxSearch); // Searches for a card inside that view.
router.post('/deckbox', isLoggedIn, cardsCtrl.addToBox); // Adds searched card to list of cards.
router.delete('/deckbox/delete/:id', isLoggedIn, cardsCtrl.boxDeleteOne); // Deletes a specific card from your deckbox.

router.get('/decks', isLoggedIn, decksCtrl.showIndex); // Gets list of decks.
router.post('/decks/add', isLoggedIn, decksCtrl.addToDecks); // Adds a new deck to list of decks.
router.delete('/deck/delete/:id', isLoggedIn, decksCtrl.deleteDeck); // Delete a deck

router.get('/decks/:id', isLoggedIn, modDeckCtrl.showDeck); // Shows a specific deck (from the href).
router.get('/decklist/search', isLoggedIn, modDeckCtrl.decklistSearch); // Searches for a card inside that view.
router.post('/decklist/add', isLoggedIn, modDeckCtrl.addToThisDeck); // Adds a card to a specific deck.
router.put('/decklist/name/:id', isLoggedIn, modDeckCtrl.editDeckName); // Edits the deck's name
router.delete('/decklist/delete/:id', isLoggedIn, modDeckCtrl.deleteFromDeck); // Deletes a card from the decklist.

// Middleware for Logged In User Features
function isLoggedIn(req, res, next) {
  if ( req.isAuthenticated() ) return next();
  res.redirect('/auth/google');
}

module.exports = router;

// https://api.scryfall.com/cards/named?exact=Yuriko,%20the%20tiger%27s%20shadow
// versus with set:
// https://api.scryfall.com/cards/named?set=J19&exact=Yuriko,%20the%20tiger%27s%20shadow
