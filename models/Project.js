const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    created_on: {
        type: Date,
        default: Date.now
    },
}, { _id: true})


module.exports = mongoose.model('Project', ProjectSchema)