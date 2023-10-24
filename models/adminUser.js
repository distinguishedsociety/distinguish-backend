const mongoose = require("mongoose");
const validator = require("validator");

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error("Invalid Email");
      },
    },
    password: {
      type: String,
      trim: true,
      minlength: 5,
    }
  },
  { timestamps: true }
);


const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
