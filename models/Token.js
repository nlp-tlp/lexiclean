const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = mongoose.Schema({
    value: {
        type: String,
        required: true
    },
    replacement: {
        type: String,
        required: false
    },
    domain_specific: {
        type: Boolean,
        required: true,
        default: false
    },
    abbreviation: {
        type: Boolean,
        required: true,
        default: false
    },
    english_word: {
        type: Boolean,
        required: true,
        default: false
    }
}, {_id: true})

module.exports = mongoose.model('Token', TokenSchema)