const Joi = require("joi");
const Category = require("../models/category");

const createCategory = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string(),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res
        .status(400)
        .send({ status: "error", message: result.error.details[0].message });

    const category = Category({ name: req.body.name });
    await category.save();

    return res.status(200).send({ status: "success", data: category });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    return res.status(200).send({ status: "success", data: categories });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const allowedUpdates = ["name"];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      res.status(400).send({ status: "error", message: "Invalid Upadates!" });
    }

    const category = await Category.findById({ _id: req.params.id });
    if (!category)
      return res
        .status(404)
        .send({ status: "error", message: "Category not found." });

    updates.forEach((update) => (category[update] = req.body[update]));
    await category.save();

    return res.status(200).send({ status: "success", data: category });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const result = await Category.deleteOne({ _id: req.params.id });
    if (result.deletedCount == 0)
      return res
        .status(404)
        .send({ status: "error", message: "Category not found" });

    return res
      .status(200)
      .send({ status: "success", data: `${result.deletedCount} deleted` });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
