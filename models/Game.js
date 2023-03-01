const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    board: {
        type: [String],
        required: true,
    },
    turn: {
        type: String,
        required: true,
    },
    winner: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
