const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TokenSchema = mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
    },
    meta_tags: {
      type: Schema.Types.Mixed,
      required: false,
    },
    replacement: {
      type: String,
      required: false,
      default: null,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    suggested_replacement: {
      type: String,
      required: false,
      default: null,
    },
    project_id: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },
    last_modified: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: true }
);

module.exports = mongoose.model("Token", TokenSchema);
