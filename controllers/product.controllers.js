const Joi = require("joi");
const Inventory = require("../models/inventory");
const Order = require("../models/order");
const Product = require("../models/product");

const createProduct = async (req, res) => {
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
      modelBanner: Joi.string().empty("").default(""),
      price: Joi.string().required(),
      isLimitedEdition: Joi.boolean().default(false),
      noOfUnitsOfLimitedEdition: Joi.number().default(0)
    }); 

    const result = schema.validate(req.body);
    if (result.error)
      return res.status(400).send({
        status: "error",
        message: result.error.details[0].message,
      });

    const product = new Product(req.body);
    await product.save();

    const inventory = new Inventory({ productId: product._id });

    return res.status(201).send({ status: "success", data: product });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate([
      "category",
      "collectionName",
    ]);
    console.log(products);

    return res.status(200).send({ status: "success", data: products });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate([
      "category",
      "collectionName",
    ]);
    console.log(product);

    return res.status(200).send({ status: "success", data: product });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const allowedUpdates = [
      "title",
      "description",
      "category",
      "slug",
      "SKU",
      "images",
      "collectionName",
      "modelName",
      "modelBanner",
      "price",
      "isLimitedEdition",
      "noOfUnitsOfLimitedEdition"
    ];
    const updates = Object.keys(req.body);
    console.log(req.body);
    console.log(updates);
    const isValidOperation = updates.every((update) => {
      console.log(update);
      return allowedUpdates.includes(update);
    });

    if (!isValidOperation) {
      return res.status(400).send({
        status: "error",
        message: "Invalid Upadates!",
      });
    }

    const product = await Product.findOne({ slug: req.params.slug });
    if (!product)
      return res
        .status(404)
        .send({ status: "error", message: "Product not found." });

    updates.forEach((update) => (product[update] = req.body[update]));
    console.log(product);
    await product.save();

    return res.status(200).send({ status: "success", data: product });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const result = await Product.deleteOne({ _id: req.params.id });
    console.log(result);
    if (result.deletedCount == 0)
      return res
        .status(404)
        .send({ status: "error", message: "Product not found." });

    return res.status(200).send({
      status: "success",
      data: `${result.deletedCount} deleted`,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate(["products", "user"]).sort({'createdAt': -1});
    console.log(orders);

    return res.status(200).send({ status: "success", data: orders });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(["user", { path: "products", populate: { path: "product", model: "Product" }}])    
    console.log(order);

    return res.status(200).send({ status: "success", data: order });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProduct,
  getOrders,
  getOrder
};
