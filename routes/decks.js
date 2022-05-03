var express = require('express');
var router = express.Router();
const request = require('request');
const decksCtrl = require('../controllers/decks');

router.get('/decks', isLoggedIn, decksCtrl.showIndex); // Gets list of decks.
router.post('/decks/add', isLoggedIn, decksCtrl.addToDecks); // Adds a new deck to list of decks.
router.delete('/deck/delete/:id', isLoggedIn, decksCtrl.deleteDeck); // Delete a deck

// Middleware for Logged In User Features
function isLoggedIn(req, res, next) {
    if ( req.isAuthenticated() ) return next();
    res.redirect('/auth/google');
}

module.exports = router;