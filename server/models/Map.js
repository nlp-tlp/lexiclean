const mongoose = require("mongoose");

const MapSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    tokens: [
      {
        type: String,
        required: false,
      },
    ],
    replacements: [{}],
    colour: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    last_modified: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: true, timestamps: true }
);

module.exports = mongoose.model("Map", MapSchema);
