const mongoose = require('mongoose');

const pokemonSchema = new mongoose.Schema({
    name: String,
    type: [String],
    image: [{
        filename: String,
        path: String,
    }],
    HP: Number,
    attack: Number,
    defense: Number,
    speed: Number,
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
});

const Pokemon = new mongoose.model('Pokemon', pokemonSchema);
module.exports = Pokemon;