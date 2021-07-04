const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const TextSchema = mongoose.Schema({
    // Project id is here as its required when filtering texts with mongoose paginate aggregator. Otherwise a list of
    // doc_ids would need to be queried from the project collection every pagination event.
    // required is false as the project_id isn't available before texts are populated.
    project_id: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: false 
    },
    original: {
        type: String,
        required: true
    },
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
    weight: {
        type: Number,
        required: false,
    },
    annotated: {
        type: Boolean,
        required: false,
        default: false
    },
    tokenization_hist: [
    ],
    rank: {
        type: Number
    },
    last_modified: {
        type: Date,
        required: true,
        default: Date.now,
    }
}, { _id: true})


TextSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('Text', TextSchema)