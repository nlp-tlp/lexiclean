const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = mongoose.Schema({
    value: {
        type: String,
        required: true
    },
    replacement: {
        type: String,
        required: false,
        default: null
    },
    suggested_replacement: {
        type: Array,
        required: false,
        default: null
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
    },
    noise: {
        type: Boolean,
        required: true,
        default: false
    },
    unsure: {
        type: Boolean,
        required: true,
        default: false
    },
    removed: {
        type: Boolean,
        required: true,
        default: false
    },
    suggested_meta_tag: [{
        name: { type: String, required: false },
        value: { type: String, required: false }
    }],
    last_modified: {
        type: Date,
        required: true,
        default: Date.now,
    }
}, {_id: true})

module.exports = mongoose.model('Token', TokenSchema)