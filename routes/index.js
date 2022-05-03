var express = require('express');
var router = express.Router();
const request = require('request');
const cardsCtrl = require('../controllers/cards');

router.get('/', function(req, res){
  res.redirect('/home');
})
router.get('/home', cardsCtrl.index); // Front page.
router.get('/home/search', cardsCtrl.indexSearch); // Searches for a card inside that view.
router.get('/card/:id', isLoggedIn, cardsCtrl.showCard); // Shows a specific card's details.

// Middleware for Logged In User Features
function isLoggedIn(req, res, next) {
  if ( req.isAuthenticated() ) return next();
  res.redirect('/auth/google');
}

module.exports = router;

// https://api.scryfall.com/cards/named?exact=Yuriko,%20the%20tiger%27s%20shadow
// versus with set:
// https://api.scryfall.com/cards/named?set=J19&exact=Yuriko,%20the%20tiger%27s%20shadow
