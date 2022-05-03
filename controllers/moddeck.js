var express = require('express');
const Deck = require('../models/deck');
const Card = require('../models/card');
const User = require('../models/user');
const request = require('request');
const rootURL = "https://api.scryfall.com/cards/named?";
let cardCache; // Already JSON parsed
let deckID; // Holds specific deck's ID
// root: https://api.scryfall.com/cards/named?
// set: set=J19&
// exact query: exact=Yuriko,%20the%20tiger%27s%20shadow
// full example URL: https://api.scryfall.com/cards/named?set=J19&exact=Yuriko,%20the%20tiger%27s%20shadow

module.exports = { 
    showDeck,
    addToThisDeck,
    decklistSearch,
    deleteFromDeck,
    editDeckName,
}

function showDeck(req, res) {
    let card = {};
    let sortedDecklist = [];
    deckID = req.params.id;
    Deck.findById(deckID).populate('cards').exec(function(err, deck) {
        deck.cards.forEach(function(d){
            sortedDecklist.push(d);
        })
        sortedDecklist.sort(function(a, b) {
            return a.name.localeCompare(b.name) || a.set.localeCompare(b.set) || b.collector_number - a.collector_number;
        });
        res.render('cards/decklist', {
            deckID,
            title: deck.name,
            card,
            user: req.user,
            decklist: sortedDecklist,
        });
    });
};

function decklistSearch(req, res) {
    let sortedDecklist = [];
    const name = req.query.name;
    const set = req.query.set;
    let URL;
    if (!req.query.set) {
        URL = (rootURL + "&fuzzy=" + name);
    } else {
        URL = (rootURL + "set=" + set + "&fuzzy=" + name);
    }
    // Gotta love URIs sometimes.
    let encodedURL = encodeURI(URL);
    encodedURL = encodedURL.replace("'", "%27");
    request(URL, function(err, response, body) {
        const card = JSON.parse(body);
        cardCache = card;
        Deck.findById(deckID).populate('cards').exec(function(err, deck) {
            deck.cards.forEach(function(d){
                sortedDecklist.push(d);
            })
            sortedDecklist.sort(function(a, b) {
                return a.name.localeCompare(b.name) || a.set.localeCompare(b.set) || b.collector_number - a.collector_number;
            });
            res.render('cards/decklist', {
                deckID,
                title: deck.name,
                card,
                user: req.user,
                decklist: sortedDecklist,
            });
        });
    });
};

function addToThisDeck(req, res) {
    let query = { set: cardCache.set , collector_number: cardCache.collector_number, name: cardCache.name };
    Card.findOne(query, (function(err, found){
        if (found === null) {
            Card.create(cardCache, function(err, card){
                card.copiesInDeck = 1;
                card.save();
                Deck.findById(deckID, function(err, deck) {
                    req.user.cards.push(card);
                    req.user.save();
                    deck.cards.push(card);
                    deck.save(function(err) {
                        res.redirect('/decks/' + deckID);
                    });
                });
            });
        } else { // The card has been found
            User.findById(req.user.id).populate('cards').exec(function(err, user){ // Find the user and populate
                let needNew = true;
                user.cards.forEach(function(c){
                    if (c.name === cardCache.name && c.set === cardCache.set && c.collector_number === cardCache.collector_number){
                        c.copiesInDeck++;
                        if (c.copiesInDeck > c.quantity) {
                            c.quantity = c.copiesInDeck;
                        }
                        c.save();
                        needNew = false;
                        Deck.findById(deckID, function(err, deck) {
                            deck.cards.push(c);
                            deck.save(function(err) {
                                res.redirect('/decks/' + deckID);
                            });
                        });
                    };
                });
                console.log(needNew);
                if (needNew) {
                    Card.create(cardCache, function(err, card){
                        req.user.cards.push(card);
                        req.user.save(function(err) {
                            Deck.findById(deckID, function(err, deck) {
                                deck.cards.push(card);
                                deck.save(function(err) {
                                    res.redirect('/decks/' + deckID);
                                });
                            });
                        });
                    });
                };
            });
        };
    }));
};

function deleteFromDeck(req, res) {
    let id = req.params.id;
    Card.findById(req.params.id, function(err, card){
        card.copiesInDeck--;
        card.save();
        Deck.findById(deckID, function(err, deck) {
            const idx = deck.cards.indexOf(id);
            deck.cards.splice(idx, 1);
            deck.save(function(err) {
                res.redirect('/decks/' + deckID);
            });
        });
    });
};

function editDeckName(req, res) {
    Deck.findById(req.params.id, function(err, deck) {
        deck.name = req.body.name;
        deck.save(function(err) {
            res.redirect('/decks/' + req.params.id);            
        });
    });
}