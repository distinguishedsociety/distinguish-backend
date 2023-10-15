const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  slug: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  SKU: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  price: {
    type: String,
    required: true,
    default: "0",
  },
  images: [
    {
      type: String,
      trim: true,
      required: true,
    },
  ],
  // inventory: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Inventory",
  // },
  inventory: {
    XS: {
      type: Number,
      min: 0,
      default: 0,
    },
    S: {
      type: Number,
      min: 0,
      default: 0,
    },
    M: {
      type: Number,
      min: 0,
      default: 0,
    },
    L: {
      type: Number,
      min: 0,
      default: 0,
    },
    XL: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  collectionName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection",
  },
  modelName: {
    type: String,
    default: "",
  },
  modelBanner: {
    type: String,
    default: "",
  },
  isLimitedEdition: {
    type: Boolean,
    default: false
  },
  noOfUnitsOfLimitedEdition: {
    type: Number,
    default: 0
  }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
