const Joi = require("joi");
const Color = require("../models/color");

const createColor = async (req, res) => {
  try {
    const schema = Joi.object({
      colorCode: Joi.string(),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res
        .status(400)
        .send({ status: "error", message: result.error.details[0].message });

    const color = Color({ colorCode: req.body.colorCode });
    await color.save();

    return res.status(200).send({ status: "success", data: color });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const getColors = async (req, res) => {
  try {
    const colors = await Color.find();

    return res.status(200).send({ status: "success", data: colors });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const updateColor = async (req, res) => {
  try {
    const allowedUpdates = ["colorCode"];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      res.status(400).send({ status: "error", message: "Invalid Upadates!" });
    }

    const color = await Color.findById({ _id: req.params.id });
    if (!color)
      return res
        .status(404)
        .send({ status: "error", message: "Color not found." });

    updates.forEach((update) => (color[update] = req.body[update]));
    await color.save();

    return res.status(200).send({ status: "success", data: color });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const deleteColor = async (req, res) => {
  try {
    const res = await Color.deleteOne({ _id: req.params.id });
    if (res.deletedCount == 0)
      return res
        .status(404)
        .send({ status: "error", message: "Color not found." });

    return res
      .status(200)
      .send({ status: "success", data: `${res.deletedCount} deleted` });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

module.exports = {
  createColor,
  getColors,
  updateColor,
  deleteColor,
};
