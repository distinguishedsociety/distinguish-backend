const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema({
  colorCode: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
});

const Color = mongoose.model("Color", colorSchema);

module.exports = Color;
