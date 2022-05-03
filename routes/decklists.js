var express = require('express');
var router = express.Router();
const request = require('request');
const modDeckCtrl = require('../controllers/moddeck');

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