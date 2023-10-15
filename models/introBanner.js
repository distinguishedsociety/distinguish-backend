const mongoose = require("mongoose");

const introBannerSchema = new mongoose.Schema(
  {
    image1: {
      type: String,
      required: true,
      trim: true,
    },
    image2: {
      type: String,
      required: true,
      trim: true,
    },
    heading: {
        type: String,
        required: true,
        trim: true,
      },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const IntroBanner = mongoose.model("IntroBanner", introBannerSchema);

module.exports = IntroBanner;
