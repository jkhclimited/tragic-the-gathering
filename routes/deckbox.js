var express = require('express');
var router = express.Router();
const request = require('request');
const cardsCtrl = require('../controllers/cards');

router.get('/deckbox', isLoggedIn, cardsCtrl.boxShow); // Gets list of cards.
router.get('/deckbox/search', isLoggedIn, cardsCtrl.boxSearch); // Searches for a card inside that view.
router.post('/deckbox', isLoggedIn, cardsCtrl.addToBox); // Adds searched card to list of cards.
router.delete('/deckbox/delete/:id', isLoggedIn, cardsCtrl.boxDeleteOne); // Deletes a specific card from your deckbox.

// Middleware for Logged In User Features
function isLoggedIn(req, res, next) {
    if ( req.isAuthenticated() ) return next();
    res.redirect('/auth/google');
}

module.exports = router;