const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    texts: [{
        type: Schema.Types.ObjectId,
        ref: 'Text',
        required: true
    }],
    maps: [{
        type: Schema.Types.ObjectId,
        ref: 'Map',
        required: true
    }],
    created_on: {
        type: Date,
        required: true,
        default: Date.now
    },
    last_modified: {
        type: Date,
        required: true,
        default: Date.now,
    }
}, { _id: true})


module.exports = mongoose.model('Project', ProjectSchema)