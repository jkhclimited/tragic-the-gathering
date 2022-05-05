var express = require('express');
const User = require('../models/user');
const Card = require('../models/card');
const request = require('request');
const rootURL = "https://api.scryfall.com/cards/named?";
// root: https://api.scryfall.com/cards/named?
// set: set=J19&
// exact query: exact=Yuriko,%20the%20tiger%27s%20shadow
let cardCache; // Already JSON parsed

module.exports = {
    index,
    indexSearch,
    boxShow,
    boxSearch,
    addToBox,
    showCard,
    boxDeleteOne,
}

function index(req, res, next,) {
    let card = {};
    res.render('cards/main', {
        title: "Home", 
        card,
        user: req.user,
    });
};

// GET name and set (optional)
function indexSearch(req, res, next,) {
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
        res.render('cards/main', {
            title: "Home", 
            card,
            user: req.user,
        });
    });
}

function boxShow(req, res, next,) {
    let card = {};
    let sortedDeckbox = [];
    User.findById(req.user.id).populate('cards').exec(function(err, user) {
        user.cards.forEach(function(c){
            sortedDeckbox.push(c);
        })
        sortedDeckbox.sort(function(a, b) {
            return a.name.localeCompare(b.name) || a.set.localeCompare(b.set) || b.collector_number - a.collector_number;
        });
        res.render('cards/deckbox', {
            title: "Deckbox",
            card,
            user: req.user,
            cardlist: sortedDeckbox,
        });
    });
};

function boxSearch(req, res) {
    cardCache = {};
    let sortedDeckbox = [];
    const name = req.query.name;
    const set = req.query.set;
    let URL;
    if (!req.query.set) {
        URL = (rootURL + "&fuzzy=" + name);
    } else {
        URL = (rootURL + "set=" + set + "&fuzzy=" + name);
    }
    let encodedURL = encodeURI(URL);
    encodedURL = encodedURL.replace("'", "%27");
    request(URL, function(err, response, body) {
        const card = JSON.parse(body);
        cardCache = card;
        User.findById(req.user.id).populate('cards').exec(function(err, user) {
            user.cards.forEach(function(c){
                sortedDeckbox.push(c);
            })
            sortedDeckbox.sort(function(a, b) {
                return a.name.localeCompare(b.name) || a.set.localeCompare(b.set) || b.collector_number - a.collector_number;
            });
            res.render('cards/deckbox', {
                title: "Deckbox",
                card,
                user: req.user,
                cardlist: sortedDeckbox,
            });
        });
    });
};

function addToBox(req, res) {
    let query = { set: cardCache.set , collector_number: cardCache.collector_number, name: cardCache.name };
    Card.findOne(query, function(err, found) {
        if (found === null) {
            Card.create(cardCache, function(err, card){
                card.image_link = cardCache.image_uris.normal;
                card.save(function(err){
                    req.user.cards.push(card);
                    req.user.save(function(err) {
                        res.redirect('/deckbox');
                    });
                });
            });
        } else { // The card is found
            User.findById(req.user.id).populate('cards').exec(function(err, user){ // Find the user and populate
                let needNew = true;
                user.cards.forEach(function(c){
                    if (c.name === cardCache.name && c.set === cardCache.set && c.collector_number === cardCache.collector_number){
                        c.quantity++;
                        c.save();
                        needNew = false;
                        res.redirect('/deckbox');
                    };
                });
                if (needNew) {
                    Card.create(cardCache, function(err, card){
                        card.image_link = cardCache.image_uris.normal;
                        card.save(function(err){
                            req.user.cards.push(card);
                            req.user.save(function(err) {
                                res.redirect('/deckbox');
                            });
                        });
                    });
                };
            });
        };
    });
};

function showCard(req, res) {
    Card.findById(req.params.id, function(err, card){
        res.render('cards/card', {
            title: card.name,
            card,
            user: req.user,
        })
    });
}

function boxDeleteOne(req, res) {
    Card.findByIdAndDelete(req.params.id, function(err, card){
        res.redirect('/deckbox');
    })
}