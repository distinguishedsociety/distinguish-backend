const Joi = require("joi");
const Collection = require("../models/collection");

const createCollection = async (req, res) => {
  try {
    const schema = Joi.object({
      title: Joi.string(),
      description: Joi.string(),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res
        .status(400)
        .send({ status: "error", message: result.error.details[0].message });

    const collection = Collection({
      title: req.body.title,
      description: req.body.description,
    });
    await collection.save();

    return res.status(200).send({ status: "success", data: collection });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find();

    return res.status(200).send({ status: "success", data: collections });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const updateCollection = async (req, res) => {
  try {
    const allowedUpdates = ["title", "description"];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      res.status(400).send({ status: "error", message: "Invalid Upadates!" });
    }

    const collection = await Collection.findById({ _id: req.params.id });
    if (!color)
      return res
        .status(404)
        .send({ status: "error", message: "Collection not found." });

    updates.forEach((update) => (collection[update] = req.body[update]));
    await collection.save();

    return res.status(200).send({ status: "success", data: collection });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const deleteCollection = async (req, res) => {
  try {
    const res = await Collection.deleteOne({ _id: req.params.id });
    if (res.deletedCount == 0)
      return res
        .status(404)
        .send({ status: "error", message: "Collection not found." });

    return res
      .status(200)
      .send({ status: "success", data: `${res.deletedCount} deleted` });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

module.exports = {
  createCollection,
  getCollections,
  updateCollection,
  deleteCollection,
};
