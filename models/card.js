var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new mongoose.Schema({
  name: String,       // name
  mana_cost: String,  // mana_cost
  type_line: String,  // type_line
  power: String,      // power
  toughness: String,  // toughness
  set: String,        // set
  set_name: String,   // set_name
  oracle_text: String,// oracle_text
  collector_number: Number, // collector_number
  quantity: {
    type: Number,     // n/a
    default: 1,
  },
  rarity: String,     // rarity
  nonfoil: Boolean,   // nonfoil
  foil: Boolean,      // foil
  copiesInDeck: {
    type: Number,
    default: 0,
  }, // n/a
  condition: {
    type: String,
    default: "NM",
  },
}, {
  timestamps: false
});

module.exports = mongoose.model('Card', cardSchema);
