const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  productId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  ],
  qty: [
    {
      size: {
        type: String,
        enum: ["XS", "S", "M", "L", "XL"],
        required: true,
      },
      color: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
        required: true,
      },
      quantity: {
        type: Number,
        min: 0,
        required: true,
      },
    },
  ],
});

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;
