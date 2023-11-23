const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    products: [],
    orderType: {
      type: String,
      enum: ["Prepaid", "COD"],
    },
    cartAmount: {
      type: String,
      required: true,
    },
    tax: {
      type: String
    },
    shippingCharges: {
      type: String,
      required: true
    },
    orderAmount: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      default: "",
    },
    shippingDetails: {
      address: {
        type: String,
        trim: true,
      },
      firstName: {
        type: String,
        trim: true,
      },
      lastName: {
        type: String,
        trim: true,
      },
      email: {
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
      phoneNumber: {
        type: String,
        trim: true,
      },
    },
    orderStatus: {
      type: String,
      enum: ["Initiated", "Placed", "Delivered", "Canceled"],
      default: "Initiated",
    },
    isCouponApplied: {
      type: Boolean,
      default: false,
    },
    discountPrice: {
      type: String,
    },
    couponCode: {
      type: String,
    },
    currCode: {
      type: String,
    },
    currRate: {
      type: Number,
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
