var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  cards: [{type: Schema.Types.ObjectId, ref: 'Card'}],
  decks: [{type: Schema.Types.ObjectId, ref: 'Deck'}],
  googleId: String,
}, {
  timestamps: false
});

module.exports = mongoose.model('User', userSchema);