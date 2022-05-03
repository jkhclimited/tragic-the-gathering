var express = require('express');
var router = express.Router();
const passport = require('passport');

// GOogle OAuth Login Route
router.get('/auth/google', passport.authenticate(
  'google',
  { scope: ['profile', 'email']}
));

// Google OAuth CB Route
router.get('/oauth2callback', passport.authenticate(
  'google',
  {
    successRedirect: '/home',
    failureRedirect: '/home',
  }
));

// OAuth Logout Route
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/home');
});

module.exports = router;
