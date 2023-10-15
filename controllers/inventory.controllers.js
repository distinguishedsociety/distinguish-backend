const Joi = require("joi");
const Product = require("../models/product");

const createInventory = async (req, res) => {
  try {
    const schema = Joi.object({
      title: Joi.string().min(2).max(1024).required(),
      description: Joi.string().min(2).required(),
      category: Joi.string().min(4).max(1024).required(),
      slug: Joi.string().min(4).max(1024).required(),
      SKU: Joi.string().min(4).max(1024).required(),
      images: Joi.array().items(Joi.string()),
      collectionName: Joi.string(),
      modelName: Joi.string().empty("").default(""),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res
        .status(400)
        .send({ status: "error", message: result.error.details[0].message });

    const product = new Product(req.body);
    await product.save();

    return res.status(201).send({ status: "success", data: product });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const getInventory = async (req, res) => {
  try {
    const products = await Product.find();

    return res.status(200).send({ status: "success", data: products });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const updateInventory = async (req, res) => {
  try {
    const schema = Joi.object({
      XS: Joi.number().min(0).required(),
      S: Joi.number().min(0).required(),
      M: Joi.number().min(0).required(),
      L: Joi.number().min(0).required(),
      XL: Joi.number().min(0).required(),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res
        .status(400)
        .send({ status: "error", message: result.error.details[0].message });
    console.log(req.params.id);
    const product = await Product.findOne({ _id: req.params.id });
    console.log(product);
    if (!product)
      return res
        .status(404)
        .send({ status: "error", message: "Product not found." });

    product.inventory.XS = req.body.XS;
    product.inventory.S = req.body.S;
    product.inventory.M = req.body.M;
    product.inventory.L = req.body.L;
    product.inventory.XL = req.body.XL;
    await product.save();

    return res.status(200).send({ status: "success", data: product });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const deleteInventory = async (req, res) => {
  try {
    const res = await Product.deleteOne({ _id: req.params.id });
    if (res.deletedCount == 0)
      return res
        .status(404)
        .send({ status: "error", message: "Product not found." });

    return res
      .status(200)
      .send({ status: "success", data: `${res.deletedCount} deleted` });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

module.exports = {
  createInventory,
  getInventory,
  updateInventory,
  deleteInventory,
};
