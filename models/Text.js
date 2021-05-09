const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const TextSchema = mongoose.Schema({
    tokens: [{
        index: { 
            type: Number,
            required: true
        },
        token: {
            type: Schema.Types.ObjectId,
            ref: 'Token',
            required: true
        },
    }],
    annotated: {
        type: Boolean,
        required: false,
        default: false
    },
    last_modified: {
        type: Date,
        required: true,
        default: Date.now,
    }
}, { _id: true})


TextSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('Text', TextSchema)