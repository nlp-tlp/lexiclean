const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MapSchema = mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    tokens: [{
        type: String,
        required: true
    }]
}, { _id: true})


module.exports = mongoose.model('Map', MapSchema)