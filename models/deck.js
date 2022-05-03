var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deckSchema = new mongoose.Schema({
  name: String,
  cardCount: {
    type: Number,
    default: 0,
  },
  isValid: {
    type: Boolean,
    default: false,
  },
  cards: [{type: Schema.Types.ObjectId, ref: 'Card'}],
}, { timestamps: true }
);

module.exports = mongoose.model('Deck', deckSchema);