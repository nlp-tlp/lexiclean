const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const DataSchema = mongoose.Schema({
    project_id: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    tokens: [{
        index: { type: Number, required: true},
        token: { type: String, required: true}
    }],
    annotated: {
        type: Boolean,
        required: true,
        default: false
    }
}, { _id: true})


DataSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('Data', DataSchema)