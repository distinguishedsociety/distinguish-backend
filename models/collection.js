const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Collection = mongoose.model("Collection", collectionSchema);

module.exports = Collection;
