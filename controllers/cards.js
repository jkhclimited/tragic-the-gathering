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
    User.findById(req.user.id).populate({path: 'cards', options: {sort: {'name':'asc', 'set':'asc', 'collector_number':'asc'}}}).exec(function(err, user) {
        res.render('cards/deckbox', {
            title: "Deckbox",
            card,
            user: req.user,
            cardlist: user.cards,
        });
    })
};

function boxSearch(req, res) {
    cardCache = {};
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
            Card.find({}).sort({'name':'asc', 'set':'asc', 'collector_number':'asc'}).exec(function(err, cards){
                res.render('cards/deckbox', {
                    title: "Deckbox", 
                    card,
                    user: req.user,
                    cardlist: cards,
                });
            })
        });
    });
};

function addToBox(req, res) {
    let query = { set: cardCache.set , collector_num: cardCache.collector_num, name: cardCache.name };
    let update = { $inc: { quantity: 1 }};
    Card.findOneAndUpdate(query, update, (function(err, found){
        if (found === null) {
            Card.create(cardCache, function(err, card){
                req.user.cards.push(card);
                req.user.save(function(err) {
                    res.redirect('/deckbox');
                });
            });
        } else {
            res.redirect('/deckbox');
        };
    }));
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