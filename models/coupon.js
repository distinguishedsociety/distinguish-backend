const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    expiry: {
        type: Date,
    },
    code: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    discount: {
        type: Number,
        default: 10,
    }
})

const Coupon = mongoose.model('Coupon', couponSchema)

module.exports = Coupon