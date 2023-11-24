const mongoose = require("mongoose");

const continentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    currencyRate: {
      type: Number,
      required: true,
      trim: true,
    },
    countryCode: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Continent = mongoose.model("Continent", continentSchema);

module.exports = Continent;
