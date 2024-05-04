const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
    stateCode: {
        type: String,
        required: true,
        unique: true
    },
    funFacts: {
        type: [String]
    }
});

module.exports = mongoose.model('State', stateSchema);