const Joi = require("joi");
const Category = require("../models/category");
const Coupon = require("../models/coupon");

const createCoupon = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string(),
      code: Joi.string().min(3).required(),
      expiry: Joi.string().required(),
      discount: Joi.number()
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res
        .status(400)
        .send({ status: "error", message: result.error.details[0].message });

    const coupon = Coupon({ name: req.body.name, code: req.body.code, expiry: req.body.expiry, discount: req.body.discount });
    await coupon.save();

    return res.status(200).send({ status: "success", data: coupon });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();

    return res.status(200).send({ status: "success", data: coupons });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const getCoupon = async (req, res) => {
    try {
      const coupon = await Coupon.findOne({ id: req.body.id });
      if(!coupon){
        return res.status(404).send({ status: "error", message: "Coupon not found." })
      }
  
      return res.status(200).send({ status: "success", data: coupon });
    } catch (e) {
      console.log(e);
      return res.status(500).send({ status: "error", message: e.message });
    }
  };

const updateCoupon = async (req, res) => {
  try {
    const allowedUpdates = ["name", "code", "expiry", "discount"];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      res.status(400).send({ status: "error", message: "Invalid Upadates!" });
    }

    const coupon = await Coupon.findById({ _id: req.params.id });
    if (!coupon)
      return res
        .status(404)
        .send({ status: "error", message: "Coupon not found." });

    updates.forEach((update) => (coupon[update] = req.body[update]));
    await coupon.save();

    return res.status(200).send({ status: "success", data: coupon });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const result = await Coupon.deleteOne({ _id: req.params.id });
    if (result.deletedCount == 0)
      return res
        .status(404)
        .send({ status: "error", message: "Coupon not found" });

    return res
      .status(200)
      .send({ status: "success", data: `${result.deletedCount} deleted` });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  getCoupon
};
