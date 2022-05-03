var express = require('express');
const User = require('../models/user');
const Deck = require('../models/deck');
const request = require('request');

module.exports = { 
    showIndex,
    addToDecks,
    deleteDeck,
}

function showIndex(req, res) {
    User.findById(req.user.id).populate('decks').exec(function(err, user){
        Deck.find({}).sort({'updatedAt':'asc'}).exec(function(err, decks){
            res.render('cards/deck', {
                title: "Decks",
                user: req.user,
                decks: user.decks,
            });
        });
    });
};

function addToDecks(req, res) {
    Deck.create(req.body, function(err, deck){
        req.user.decks.push(deck);
        req.user.save(function(err){
            res.redirect('/decks');
        })
    })
};

function deleteDeck(req, res) {
    Deck.findByIdAndDelete(req.params.id, function(err, deck){
        res.redirect('/decks');
    })
}