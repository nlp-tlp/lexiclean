const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResultSchema = mongoose.Schema({
    doc_id: {
        type: Schema.Types.ObjectId,
        ref: 'Data',
        required: true
    },
    created_on : {
        type: Date,
        default: Date.now()
    }
}, {_id: true})

module.exports = mongoose.model('Result', ResultSchema)