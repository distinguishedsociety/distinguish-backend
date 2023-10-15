const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    imageLink: {
      type: String,
      required: true,
      trim: true,
    },
    redirectLink: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
