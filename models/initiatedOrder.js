const mongoose = require("mongoose");

const initiatedOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        size: {
          type: String,
          enum: ["XS", "S", "M", "L", "XL"],
          required: true,
        },
        color: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Color",
        },
        qty: {
          type: Number,
          min: 1,
          required: true,
        },
      },
    ],
    orderType: {
      type: String,
      enum: ["Prepaid", "COD"],
    },
    shippingDetails: {
      address: {
        type: String,
        trim: true,
      },
      pincode: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
    },
    orderStatus: {
      type: String,
      enum: ["Initiated","Placed", "Delivered", "Canceled"],
      default: "Initiated",
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  { timestamps: true }
);
