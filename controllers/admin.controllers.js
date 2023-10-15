const User = require("../models/user");
const Category = require("../models/category");
const Joi = require("joi");
const { OAuth2Client } = require("google-auth-library");
const Product = require("../models/product");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const multer = require("multer");
const AWS = require("aws-sdk");
const fs = require("fs");
var tou8 = require("buffer-to-uint8array");
const upload = require("../services/imageUpload");
const Banner = require("../models/banner");
const Order = require("../models/order");
const Blog = require("../models/blog");
const IntroBanner = require("../models/introBanner");
const singleUpload = upload.single("image");


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID_DS,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_DS,
});

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate([
      "categories",
      "collection",
    ]);

    console.log(products);

    return (
      res
        .status(200)
        // .header("x-auth-token", token)
        .send({ status: "success", data: products })
    );
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: "error", message: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const schema = Joi.object({
      productId: Joi.string().required(),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res
        .status(400)
        .send({ status: "error", message: result.error.details[0].message });

    const product = await Product.findById(req.body.productId);
    if (!product)
      return res
        .status(404)
        .send({ status: "failed", message: "Product not found." });

    return res
      .status(200)
      .header("x-auth-token", token)
      .send({ status: "success", data: product });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: "error", message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    console.log(req.file);
    const schema = Joi.object({});

    const result = schema.validate(req.body);
    if (result.error)
      return res
        .status(400)
        .send({ status: "error", message: result.error.details[0].message });

    return (
      res
        .status(200)
        //   .header("x-auth-token", token)
        .send({ status: "success", data: user })
    );
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: "error", message: error.message });
  }
};

const uploadImage = async (req, res) => {
  try {
    console.log(req.file);

    // const filename = `product-image-${Date.now().toString()}`;
    // const u8 = tou8(req.file.buffer);
    // console.log(u8);
    // const fileContent = fs.readFileSync(u8);
    // const fileType = req.file.originalName.split(".")[1];

    // const params = {
    //   Bucket: process.env.AWS_BUCKET_NAME,
    //   Key: `${filename}.${fileType}`,
    //   Body: fileContent,
    // };

    // s3.upload(params, (err, data) => {
    //   if (err) {
    //     console.log(err);
    //   }
    //   console.log(data.Location);
    // });

    singleUpload(req, res, function (err) {
      if (err) {
        console.log(err);
        return res.json({
          success: false,
          errors: {
            title: "Image Upload Error",
            detail: err.message,
            error: err,
          },
        });
      }
      // console.log(req.file.location);
      return res
        .status(200)
        .send({ status: "success", data: { imageLink: req.file.location } });
      //   let update = { profilePicture: req.file.location };

      //   User.findByIdAndUpdate(uid, update, { new: true })
      //     .then((user) => res.status(200).json({ success: true, user: user }))
      //     .catch((err) => res.status(400).json({ success: false, error: err }));
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ status: "error", message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const schema = Joi.object({});

    const result = schema.validate(req.body);
    if (result.error)
      return res
        .status(400)
        .send({ status: "error", message: result.error.details[0].message });

    return res
      .status(200)
      .header("x-auth-token", token)
      .send({ status: "success", data: user });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: "error", message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const schema = Joi.object({});

    const result = schema.validate(req.body);
    if (result.error)
      return res
        .status(400)
        .send({ status: "error", message: result.error.details[0].message });

    return res
      .status(200)
      .header("x-auth-token", token)
      .send({ status: "success", data: user });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: "error", message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    return res.status(200).send({ status: "success", data: categories });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: "error", message: error.message });
  }
};

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

    const category = new Category({ name: req.body.name });
    await category.save();

    return res.status(200).send({ status: "success", data: categories });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: "error", message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string(),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res
        .status(400)
        .send({ status: "error", message: result.error.details[0].message });

    //TODO: Change this to findByIdAndUpdate
    const category = await Category.findById(req.params.id);
    if (!category)
      return res
        .send(404)
        .send({ status: "error", message: "Category not found." });

    (category.name = req.body.name), await category.save();

    return res.status(200).send({ status: "success", data: category });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: "error", message: error.message });
  }
};
const deleteCategory = async (req, res) => {
  try {
    const result = await Category.remove({ _id: req.params.id });

    return res.status(200).send({
      status: "success",
      message: `${result.deletedCount} categories deleted.`,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: "error", message: error.message });
  }
};

const createBanner = async (req, res) => {
  try {
    const schema = Joi.object({
      imageLink: Joi.string(),
      redirectLink: Joi.string(),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res
        .status(400)
        .send({ status: "error", message: result.error.details[0].message });

    const banner = new Banner({
      imageLink: req.body.imageLink,
      redirectLink: req.body.redirectLink,
    });
    await banner.save();

    return res.status(200).send({ status: "success", data: banner });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find();

    return res.status(200).send({ status: "success", data: banners });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const result = await Banner.remove({ _id: req.params.id });

    return res.status(200).send({
      status: "success",
      message: `${result.deletedCount} banner deleted.`,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

const createBlog = async (req, res) => {
  try {
    const schema = Joi.object({
      videoLink: Joi.string(),
      bannerLink: Joi.string(),
      title: Joi.string(),
      description: Joi.string()
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res
        .status(400)
        .send({ status: "error", message: result.error.details[0].message });

    const blog = new Blog({
      videoLink: req.body.videoLink,
      bannerLink: req.body.bannerLink,
      description: req.body.description,
      title: req.body.title
    });
    await blog.save();

    return res.status(200).send({ status: "success", data: blog });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

const getIntroBanner = async (req, res) => {
  try {
    const introBanner = await IntroBanner.find();

    return res.status(200).send({ status: "success", data: introBanner });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

const createIntroBanner = async (req, res) => {
  try {
    const schema = Joi.object({
      image1: Joi.string(),
      image2: Joi.string(),
      heading: Joi.string(),
      description: Joi.string()
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res
        .status(400)
        .send({ status: "error", message: result.error.details[0].message });

    const isExist = await IntroBanner.find()
    if(isExist && isExist.length > 0) return res.status(400).send({status: "error", message: "Intro Banner already exists."})

    const introBanner = new IntroBanner({
      image1: req.body.image1,
      image2: req.body.image2,
      heading: req.body.heading,
      description: req.body.description
    });
    await introBanner.save();

    return res.status(200).send({ status: "success", data: introBanner });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

const updateIntroBanner = async (req, res) => {
  try {
    const schema = Joi.object({
      image1: Joi.string(),
      image2: Joi.string(),
      heading: Joi.string(),
      description: Joi.string()
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res
        .status(400)
        .send({ status: "error", message: result.error.details[0].message });

    const introBanner = await IntroBanner.findOne({ _id: req.params.id });
    if(!introBanner) return res.status(400).send({status: "error", message: "Intro Banner not found."})

    introBanner.image1 = req.body.image1
    introBanner.image2 = req.body.image2
    introBanner.heading = req.body.heading
    introBanner.description = req.body.description

    await introBanner.save()

    return res.status(200).send({
      status: "success",
      data: introBanner
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();

    return res.status(200).send({ status: "success", data: blogs });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({_id: req.params.id});
    if(!blog) return res.status(404).send({status: "error", message: "Blog not found."})

    return res.status(200).send({ status: "success", data: blog });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const result = await Blog.deleteOne({ _id: req.params.id });

    if(!result) return res.status(400).send({status: "error", message: "Blog not found."})

    return res.status(200).send({
      status: "success",
      message: `${result.deletedCount} blog deleted.`,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const schema = Joi.object({
      videoLink: Joi.string(),
      bannerLink: Joi.string(),
      description: Joi.string(),
      title: Joi.string()
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res
        .status(400)
        .send({ status: "error", message: result.error.details[0].message });

    const blog = await Blog.findOne({ _id: req.params.id });
    if(!blog) return res.status(400).send({status: "error", message: "Blog not found."})

    blog.videoLink = req.body.videoLink
    blog.bannerLink = req.body.bannerLink
    blog.description = req.body.description
    blog.title = req.body.title

    await blog.save()

    return res.status(200).send({
      status: "success",
      data: blog
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({'createdAt': -1});
    console.log(users);

    return res.status(200).send({ status: "success", data: users });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate(["products", "user"]).sort({'createdAt': -1});
    console.log(orders);

    const filteredOrders = orders.filter((order) => {
      return order.user._id.toString() === req.params.id
    })

    return res.status(200).send({ status: "success", data: filteredOrders });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "error", message: e.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadImage,
  getUsers,
  createBanner,
  getBanners,
  deleteBanner,
  getUserOrders,
  getBlogs,
  getBlog,
  createBlog,
  deleteBlog,
  updateBlog,
  getIntroBanner,
  createIntroBanner,
  updateIntroBanner
};
