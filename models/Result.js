const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResultSchema = mongoose.Schema({
    project_id: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    doc_id: {
        type: Schema.Types.ObjectId,
        ref: 'Data',
        required: true
    },
    token_id: {
        type: Schema.Types.ObjectId,
        ref: 'Data.tokens',
        required: true
    },
    replacement_token: {
        type: String,
        required: true
    },
    created_on : {
        type: Date,
        default: Date.now()
    }
}, {_id: true})

module.exports = mongoose.model('Result', ResultSchema)