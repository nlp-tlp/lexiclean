const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MapSchema = mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    tokens: [{
        type: String,
        required: false
    }],
    pairs: [{
    //    "original": { type: Array },
    //    "replacement": { type: String } 
    }],
    last_modified: {
        type: Date,
        required: true,
        default: Date.now,
    }
}, { _id: true})


module.exports = mongoose.model('Map', MapSchema)