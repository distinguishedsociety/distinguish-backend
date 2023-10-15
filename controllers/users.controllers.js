const User = require("../models/user");
const Joi = require("joi");
const { OAuth2Client } = require("google-auth-library");
const Product = require("../models/product");
const { authenticateUser } = require("../services/shiprocketApi");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const axios = require("axios");
const { valid } = require("joi");
const { createOrder } = require("../services/payment");
const Banner = require("../models/banner");
const Order = require("../models/order");
const Payment = require("../models/payment");
const { startSession } = require('mongoose')
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils');
const { findOne } = require("../models/user");
const Blog = require("../models/blog");
const IntroBanner = require("../models/introBanner");

const userLogin = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().min(4).max(1024).required(),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res.status(400).send({
        status: "error",
        message: result.error.details[0].message,
      });

    const checkUser = await User.findOne({email: req.body.email})
    if(!checkUser) return res.status(404).send({status: "success", message: "User with this email not found."})

    if(checkUser.isGoogleLogin == true) return res.status(400).send({status: "error", message: "Please try logging in using Google."}) 

    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();

    return res
      .status(200)
      .header("x-auth-token", token)
      .send({ status: "success", data: user });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: "error", message: error.message });
  }
};

const userRegister = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().min(4).max(1024),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res.status(400).send({
        status: "error",
        message: result.error.details[0].message,
      });

    const isExist = await User.findOne({ email: req.body.email });
    if (isExist)
      return res.status(401).send({ message: "Email id already used." });

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      isGoogleLogin: false
    });
    await user.save();
    const token = await user.generateAuthToken();

    return res
      .status(200)
      .header("x-auth-token", token)
      .send({ status: "success", data: user });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: "error", message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(["orders"])

    await user.populate({
      path: "orders.products",
      populate: {
        path: "product",
        model: "Product"
      }
    })

    console.log(user)
    return res.status(200).send({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log(ticket);
    const { name, email, picture } = ticket.getPayload();

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .send({ status: "error", message: "User not found." });

    const accessToken = await user.generateAuthToken();

    return res.status(200).header("x-auth-token", accessToken).send({
      status: "success",
      data: { name, email, picture },
    });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
};

const googleRegister = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log(ticket);
    const { name, email, picture } = ticket.getPayload();

    const isExist = await User.findOne({ email: email });
    if (isExist)
      return res.status(401).send({ message: "Email id already used." });

    const user = new User({
      name: name,
      email: email,
      isGoogleLogin: true
    });
    await user.save();
    const authToken = await user.generateAuthToken();

    return res.status(200).header("x-auth-token", authToken).send({
      status: "success",
      data: { name, email, picture },
    });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate(
      ["collectionName",
      "category"]
    ).sort({ _id: -1 });

    return res.status(200).send({
      status: "success",
      data: { products },
    });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
    }).populate(["collectionName", "category", "inventory"]);
    if (!product)
      return res
        .status(404)
        .send({ status: "error", message: "Product not found." });

    return res.status(200).send({
      status: "success",
      data: { product },
    });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
};

//Add wishlist
const addToWishlist = async (req, res) => {
  try {
    const schema = Joi.object({
      slug: Joi.string().required(),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res.status(400).send({
        status: "error",
        message: result.error.details[0].message,
      });

    const product = await Product.findOne({ slug: req.body.slug }).populate([
      "collectionName",
      "category",
      "inventory",
    ]);
    if (!product)
      return res
        .status(404)
        .send({ status: "error", message: "Product not found." });

    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      model: "Product",
    });

    let isFound = false;
    let indexOfFound;
    user.wishlist.map((item, index) => {
      if (item.slug === req.body.slug) {
        isFound = true;
        indexOfFound = index;
      }
    });
    if (!isFound) {
      user.wishlist.push(product._id);
      await user.save();
    }
    console.log(user.wishlist);

    return res.status(200).send({ status: "success", data: user.wishlist });
  } catch (e) {
    return res.status(400).send({ status: "error", message: e.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const schema = Joi.object({
      slug: Joi.string().required(),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res.status(400).send({
        status: "error",
        message: result.error.details[0].message,
      });

    const product = await Product.findOne({ slug: req.body.slug }).populate([
      "collectionName",
      "category",
      "inventory",
    ]);
    if (!product)
      return res
        .status(404)
        .send({ status: "error", message: "Product not found." });

    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      model: "Product",
    });

    let isFound = false;
    let indexOfFound;
    user.wishlist.map((item, index) => {
      if (item.slug === req.body.slug) {
        isFound = true;
        indexOfFound = index;
      }
    });
    if (isFound) {
      user.wishlist.splice(indexOfFound, 1);
      await user.save();
    }

    return res.status(200).send({ status: "success", data: user.wishlist });
  } catch (e) {
    return res.status(400).send({ status: "error", message: e.message });
  }
};

//Add to cart
const addToCart = async (req, res) => {
  try {
    const schema = Joi.object({
      slug: Joi.string().required(),
      qty: Joi.number().min(1).required(),
      size: Joi.string().allow("XS", "S", "M", "L", "XL"),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res.status(400).send({
        status: "error",
        message: result.error.details[0].message,
      });

    const product = await Product.findOne({ slug: req.body.slug });
    if (!product)
      return res
        .status(404)
        .send({ status: "error", message: "Product not found." });

    if (product.inventory[req.body.size] < req.body.qty)
      return res
        .status(400)
        .send({ status: "error", message: "Out of stock!" });

    const user = await User.findById(req.user._id).populate({
      path: "cart",
      populate: {
        path: "product",
        model: "Product",
      },
    });

    let isFound = false;
    let indexOfFound;
    user.cart.map((item, index) => {
      if (item.product.slug === req.body.slug && item.size === req.body.size) {
        isFound = true;
        indexOfFound = index;
      }
    });
    if (isFound) {
      user.cart[indexOfFound].qty = parseInt(req.body.qty);
    } else {
      user.cart.push({
        product: product._id,
        qty: req.body.qty,
        size: req.body.size,
      });
    }
    await user.save();

    return res.status(200).send({ status: "success", data: user.cart });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

//Get cart
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "cart",
      populate: {
        path: "product",
        model: "Product",
      },
    });

    return res.status(200).send({ status: "success", data: user.cart });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

//Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const schema = Joi.object({
      slug: Joi.string().required(),
      qty: Joi.number().min(0).required(),
      size: Joi.string().allow("XS", "S", "M", "L", "XL"),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res.status(400).send({
        status: "error",
        message: result.error.details[0].message,
      });

    const product = await Product.findOne({ slug: req.body.slug });
    if (!product)
      return res
        .status(404)
        .send({ status: "error", message: "Product not found." });

    const user = await User.findById(req.user._id).populate({
      path: "cart",
      populate: {
        path: "product",
        model: "Product",
      },
    });

    let isFound = false;
    let indexOfFound;
    user.cart.map((item, index) => {
      if (item.product.slug === req.body.slug && item.size === req.body.size) {
        isFound = true;
        indexOfFound = index;
      }
    });
    if (isFound) {
      if (parseInt(req.body.qty) === 0) {
        console.log("Remove product");
        user.cart.splice(indexOfFound, 1);
      } else {
        user.cart[indexOfFound].qty = req.body.qty;
      }
    }

    await user.save();

    return res.status(200).send({ status: "success", data: user.cart });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", data: e.message });
  }
};

//Update cart
const updateCart = async (req, res) => {
  try {
    const schema = Joi.object({
      id: Joi.string().required(),
      qty: Joi.number().min(0).required(),
      size: Joi.string().allow("XS", "S", "M", "L", "XL"),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res.status(400).send({
        status: "error",
        message: result.error.details[0].message,
      });

    const user = await User.findById(req.user._id).populate({
      path: "cart",
      populate: {
        path: "product",
        model: "Product",
      },
    });

    

    let isFound = false;
    let indexOfFound;
    user.cart.map((item, index) => {
      if (item._id == req.body.id) {
        isFound = true;
        indexOfFound = index;
      }

      

      // if (!isFound)
      //   return res
      //     .status(400)
      //     .send({ status: "error", message: "Product not found in cart." });
    });

    if (isFound) {
      if (parseInt(req.body.qty) === 0) {
        console.log("Remove product");
        user.cart.splice(indexOfFound, 1);
      }else if(user.cart[indexOfFound].product.inventory[req.body.size] < req.body.qty){
        return res.status(400).send({status: "error", message: "Not enough inventory."})
      }
       else {
        user.cart[indexOfFound].qty = req.body.qty;
        user.cart[indexOfFound].size = req.body.size;
      }
    }

    await user.save();

    delete user.inventory;

    return res.status(200).send({ status: "success", data: user.cart });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", data: e.message });
  }
};

//Check Pincode Availability
const checkPincodeAvailability = async (req, res) => {
  try {
    const schema = Joi.object({
      pincode: Joi.string().required(),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res.status(400).send({
        status: "error",
        message: result.error.details[0].message,
      });

    const email = "demo123@demo.com";
    const password = "Passw0rd.";

    axios({
      method: "post",
      url: "https://apiv2.shiprocket.in/v1/external/auth/login",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then(function (response) {
        const body = {
          delivery_postcode: req.body.pincode,
          weight: "0.5",
          cod: false,
          pickup_postcode: "422010",
        };

        var config = {
          method: "get",
          url: "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${response.data.token}`,
          },
          data: JSON.stringify(body),
        };

        axios(config)
          .then(function (response) {
            console.log(JSON.stringify(response.data));
            return res.send({
              status: "success",
              data: response.data,
            });
          })
          .catch(function (error) {
            console.log(error);
            return res
              .status(500)
              .send({ status: "error", error: error.message });
          });
      })
      .catch(function (error) {
        console.log(error);
        return res.status(500).send({ status: "error", message: error });
      });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

//Check International Pincode Availability
const checkInternationalPincodeAvailability = async (req, res) => {
  try {
    const schema = Joi.object({
      pincode: Joi.string().required(),
      delivery_country: Joi.string().required(),
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res.status(400).send({
        status: "error",
        message: result.error.details[0].message,
      });

    const email = "demo123@demo.com";
    const password = "Passw0rd.";

    axios({
      method: "post",
      url: "https://apiv2.shiprocket.in/v1/external/auth/login",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then(function (response) {
        const body = {
          delivery_postcode: req.body.pincode,
          weight: "0.5",
          cod: false,
          pickup_postcode: "422010",
          delivery_country: req.body.delivery_country,
        };

        var config = {
          method: "get",
          url: "https://apiv2.shiprocket.in/v1/external/courier/international/serviceability",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${response.data.token}`,
          },
          data: JSON.stringify(body),
        };

        axios(config)
          .then(function (response) {
            console.log(JSON.stringify(response.data));
            return res.send({
              status: "success",
              data: response.data,
            });
          })
          .catch(function (error) {
            console.log(error);
            return res
              .status(500)
              .send({ status: "error", error: error.message });
          });
      })
      .catch(function (error) {
        console.log(error);
        return res.status(500).send({ status: "error", message: error });
      });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

//Checkout
// - Calculate subtotal
// - Calculate shipping charges
// - Calculate Total amount
const fetchCartDeliveryOptions = async (req, res) => {
  try {
    const schema = Joi.object({
      pincode: Joi.string().required(),
      delivery_country: Joi.string().required(),
      order_type: Joi.string().allow("Prepaid", "COD").required(),
      cart: Joi.array().items(Joi.object({
        product: Joi.object().required(),
        qty: Joi.number(),
        size: Joi.string().valid("S", "M", "L", "XL")
      }))
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res.status(400).send({
        status: "error",
        message: result.error.details[0].message,
      });

    // const user = await User.findById(req.user._id).populate({
    //   path: "cart",
    //   populate: {
    //     path: "product",
    //     model: "Product",
    //   },
    // });

    console.log("Req body cart: ", req.body.cart);

    //Calculate weight of products
    let totalNoOfProducts = 0;
    req.body.cart.map((item) => {
      totalNoOfProducts += item.qty;
    });
    const totalWeight = totalNoOfProducts * 0.3;

    //Get token from shiprocket
    const email = "demo123@demo.com";
    const password = "Passw0rd.";

    console.log("totalNoOfProducts" , totalNoOfProducts , "totalWeight" , totalWeight)
    axios({
      method: "post",
      url: "https://apiv2.shiprocket.in/v1/external/auth/login",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then(function (response) {
        if (req.body.delivery_country != "India") {
          console.log("weight" ,totalWeight);
          const body = {
            delivery_postcode: req.body.pincode,
            weight: totalWeight.toString(),
            cod: false,
            pickup_postcode: "422010",
            delivery_country: req.body.delivery_country,
          };

          var config = {
            method: "get",
            url: "https://apiv2.shiprocket.in/v1/external/courier/international/serviceability",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${response.data.token}`,
            },
            data: JSON.stringify(body),
          };

           axios(config)
            .then(function (response) {
              console.log(JSON.stringify(response.data));
              let courier_company;
              response.data.data.available_courier_companies.map(
                (company, index) => {
                  if (index == 0) courier_company = company;

                  if (courier_company.rate.rate > company.rate.rate)
                    courier_company = company;
                }
              );
              return res.send({
                status: "success",
                data: courier_company,
              });
            })
            .catch(function (error) {
              console.log(error);
              return res.status(500).send({
                status: "error",
                error: error.message,
              });
            });
        } else {
          //Free PAN India shipping
          return res.status(200).send({
            status: "success",
            data: {
              rate: {
                rate: 0,
              },
            },
          });
        }
      })
      .catch(function (error) {
        console.log(error);
        return res.status(500).send({ data, error: error.message });
      });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

//Place order
// -Check if cart is valid
// -Check if address is deliverable
// -Create order
//If Prepaid
// -Send initiate payment link
// -On successfull payment, set order status to placed and send notification to shiprocket
//IF COD
// - set order status to placed

const placeOder = async (req, res) => {
  const session = await startSession()
  try {
    const schema = Joi.object({
      firstname: Joi.string().required(),
      lastname: Joi.string().required(),
      email: Joi.string().required(),
      address: Joi.string().required(),
      landmark: Joi.string().required(),
      state: Joi.string().required(),
      city: Joi.string().required(),
      country: Joi.string().required(),
      pincode: Joi.string().required(),
      isInternational: Joi.boolean().required(),
      delivery_country: Joi.string().required(),
      order_type: Joi.string().allow("Prepaid", "COD").required(),
      phoneNumber: Joi.string().required(),
    });
    const result = schema.validate(req.body);
    console.log("resuult" , result)

    if (result.error)
      return res.status(400).send({
        status: "error",
        message: result.error.details[0].message,
      });

    //Start transaction
    session.startTransaction()

    //Validate cart
    const user = await User.findById(req.user._id).populate({
      path: "cart",
      populate: {
        path: "product",
        model: "Product",
      },
    }).session(session);

    if (user.cart.length === 0)
      {await session.abortTransaction()
        session.endSession()
        return res
        .status(400)
        .send({ status: "error", message: "Cart is empty." });}

    user.cart.map(async (item) => {
      if (item.qty > item.product.inventory[item.size]) {
        await session.abortTransaction()
        session.endSession()
        return res.status(400).send({
          status: "error",
          message: "Cart contains out of stock items.",
        });
      }
    });

    let totalNoOfProducts = 0;
    user.cart.map((item) => {
      totalNoOfProducts += item.qty;
    });

    const totalWeight = totalNoOfProducts * 0.3;

    let cartValue = 0;
    user.cart.map((item) => {
      const itemTotalPrice = parseInt(item.product.price) * item.qty;
      cartValue = itemTotalPrice + cartValue;
    });
    console.log(cartValue);

    //Get token from shiprocket
    const email = "demo123@demo.com";
    const password = "Passw0rd.";
    let token;

    axios({
      method: "post",
      url: "https://apiv2.shiprocket.in/v1/external/auth/login",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then(function (response) {
        console.log(totalWeight);
        token = response.data.token;
        if (req.body.country != "India") {
          const body = {
            delivery_postcode: req.body.pincode,
            weight: totalWeight.toString(),
            cod: req.body.order_type === "COD" ? true : false,
            delivery_country: req.body.delivery_country,
          };

          var config = {
            method: "get",
            url: "https://apiv2.shiprocket.in/v1/external/courier/international/serviceability",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${response.data.token}`,
            },
            data: JSON.stringify(body),
          };
        } else {
          const body = {
            delivery_postcode: req.body.pincode,
            weight: totalWeight.toString(),
            cod: req.body.order_type === "COD" ? true : false,
            pickup_postcode: "422010",
          };

          var config = {
            method: "get",
            url: "https://apiv2.shiprocket.in/v1/external/courier/serviceability",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${response.data.token}`,
            },
            data: JSON.stringify(body),
          };
        }

        axios(config)
          .then(async function (response) {
            console.log(response)
            if (response.data.status === 404) {
              await session.abortTransaction()
              session.endSession()
              return res.status(400).send({
                status: "error",
                message: "Cannot deliver to this address.",
              });
            }
            let courier_company;
            response.data.data.available_courier_companies.map(
              (company, index) => {
                if (index == 0) courier_company = company;

                if (courier_company.rate.rate > company.rate.rate)
                  courier_company = company;
              }
            );

            const courier_name = courier_company.courier_name;
            const etd = courier_company.etd;
            const estimated_delivery_days =
              courier_company.estimated_delivery_days;
            const rate = courier_company.rate.rate;

            const cartValueTax = cartValue * 0.12;
            console.log("CartValueTax: ", cartValueTax)
            console.log("Shipping charges: ", rate)
            let totalCartValue;
            if (req.body.country != "India") {
              totalCartValue = cartValue + cartValueTax + parseInt(rate);
            } else {
              totalCartValue = cartValue + cartValueTax;
            }
            totalCartValue = Math.round(totalCartValue)
            console.log("Cart value: ", cartValue);
            console.log("Total cart value: ", totalCartValue)

            // -Create order
            // save razorpay order id and amount too
            const order = new Order({
              user: req.user._id,
              products: user.cart,
              orderType: req.body.order_type,
              shippingDetails: {
                address: req.body.address,
                pincode: req.body.pincode,
                city: req.body.city,
                state: req.body.state,
                country: req.body.country,
                phoneNumber: req.body.phoneNumber,
                firstName: req.body.firstname,
                lastName: req.body.lastname,
                email: req.body.email
              },
              orderStatus: "Initiated",
              orderAmount: totalCartValue,
              cartAmount: cartValue,
              tax: cartValueTax,
              shippingCharges: req.body.country != "India" ? rate : 0
            });

            await order.save({session: session});

            const order_items = [];
            user.cart.map((item) => {
              order_items.push({
                name: item.product.title,
                sku: `${item.product.SKU}-${item.size}`,
                selling_price:
                  parseInt(item.qty) + parseInt(item.product.price),
                units: item.qty
              });
            });

            if (req.body.order_type === "COD" && req.body.country == "India") {
              order.orderStatus = "Placed";
              await order.save({session: session});
              user.orders.push(order._id);
              user.cart.map(async (cartItem, index) => {
                const product = await Product.findById(cartItem.product._id)
                if(!product){
                  console.log("Product not found.")
                }else{
                  product.inventory[cartItem.size] = product.inventory[cartItem.size] - cartItem.qty
                  await product.save()
                }
                
              })
              user.cart = [];
              await user.save({session: session});



              const currDate = new Date();

              const data = {
                order_id: order._id,
                order_date: `${currDate.getFullYear().toString()}-${currDate.getMonth().toString()}-${currDate.getDate().toString()}`,
                pickup_location: "Primary",
                channel_id: "",
                comment: "",
                billing_customer_name: req.body.firstname,
                billing_last_name: req.body.lastname,
                billing_address: req.body.address,
                billing_address_2: "",
                billing_city: req.body.city,
                billing_pincode: req.body.pincode,
                billing_state: req.body.state,
                billing_country: req.body.country,
                billing_email: req.body.email,
                billing_phone: req.body.phoneNumber,
                shipping_is_billing: true,
                shipping_customer_name: req.body.firstname,
                shipping_last_name: req.body.lastname,
                shipping_address: req.body.address,
                shipping_address_2: "",
                shipping_city: req.body.city,
                shipping_pincode: req.body.pincode,
                shipping_country: req.body.country,
                shipping_state: req.body.state,
                shipping_email: req.body.email,
                shipping_phone: req.body.phoneNumber,
                order_items: order_items,
                payment_method: "COD",
                shipping_charges: 0,
                giftwrap_charges: 0,
                transaction_charges: 0,
                total_discount: 0,
                sub_total: totalCartValue,
                length: 10,
                breadth: 15,
                height: 20,
                weight: totalWeight,
              };
              const result = await axios({
                url: "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${token.toString()}`,
                },
                data: data,
              });

              console.log(result)
              if (result.status !== 200) {
                console.log(result);
                await session.abortTransaction()
                await session.endSession()
                return res.status(400).send({
                  status: "error",
                  message: "Internal server error occurred.",
                });
              }

              //send delivery details with data
              //clear the cart
              await session.commitTransaction()
              await session.endSession()
              return res.status(200).send({
                status: "success",
                data: {
                  courier_name: courier_name,
                  etd: etd,
                  estimated_delivery_days: estimated_delivery_days,
                  rate: req.body.country != "India" ? rate : "0",
                },
              });
            } else {
              // -Send initiate payment link
              
              const orderId = await createOrder(
                totalCartValue,
                order._id.toString()
              );
              order.paymentId = orderId.id;
              await order.save({session: session})

              user.orders.push(order._id);
              await user.save({session: session});

              

              
              await session.commitTransaction()
              await session.endSession()
              
              //send delivery data with response
              return res.status(200).send({
                status: "success",
                data: {
                  courier_name: courier_name,
                  etd: etd,
                  estimated_delivery_days: estimated_delivery_days,
                  rate: req.body.country != "India" ? rate : "0",
                  paymentId: orderId,
                },
              });
            }
          })
          .catch(async function (error) {
            console.log(error);
            await session.abortTransaction()
            await session.endSession()
            console.log(session)
            return res.status(500).send({
              status: "error",
              error: error.message,
            });
          });
      })
      .catch(async function (error) {
        console.log(error);
        await session.abortTransaction()
        await session.endSession()
        return res.status(500).send({ status: "error", error: error.message });
      });

    // -On successfull payment, comfirm order and send notification to shiprocket
  } catch (e) {
    console.log(e);
    await session.abortTransaction()
    await session.endSession()
    return res.status(400).send({ status: "error", message: e.message });
  }
};

const placeGuestOder = async (req, res) => {
  const session = await startSession()
  try {
    const schema = Joi.object({
      firstname: Joi.string().required(),
      lastname: Joi.string().required(),
      email: Joi.string().required(),
      address: Joi.string().required(),
      landmark: Joi.string().required(),
      state: Joi.string().required(),
      city: Joi.string().required(),
      country: Joi.string().required(),
      isInternational: Joi.boolean().required(),
      pincode: Joi.string().required(),
      delivery_country: Joi.string().required(),
      order_type: Joi.string().allow("Prepaid", "COD").required(),
      phoneNumber: Joi.string().required(),
      cart: Joi.array().items(Joi.object({
        product: Joi.object().required(),
        qty: Joi.number(),
        size: Joi.string().valid("S", "M", "L", "XL")
      }))
    });

    const result = schema.validate(req.body);
    if (result.error)
      return res.status(400).send({
        status: "error",
        message: result.error.details[0].message,
      });

    //Start transaction
    session.startTransaction()

    //Validate cart


    let totalNoOfProducts = 0;
    req.body.cart.map((item) => {
      totalNoOfProducts += item.qty;
    });

    const totalWeight = totalNoOfProducts * 0.3;

    let cartValue = 0;
    req.body.cart.map((item) => {
      const itemTotalPrice = parseInt(item.product.price) * item.qty;
      cartValue = itemTotalPrice + cartValue;
    });
    console.log(cartValue);

    //Get token from shiprocket
    const email = "demo123@demo.com";
    const password = "Passw0rd.";
    let token;

    axios({
      method: "post",
      url: "https://apiv2.shiprocket.in/v1/external/auth/login",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then(function (response) {
        token = response.data.token;
        if (req.body.isInternational) {
          const body = {
            delivery_postcode: req.body.pincode,
            weight: totalWeight.toString(),
            cod: req.body.order_type === "COD" ? true : false,
            delivery_country: req.body.delivery_country,
          };

          var config = {
            method: "get",
            url: "https://apiv2.shiprocket.in/v1/external/courier/international/serviceability",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${response.data.token}`,
            },
            data: JSON.stringify(body),
          };
        } else {
          const body = {
            delivery_postcode: req.body.pincode,
            weight: totalWeight.toString(),
            cod: req.body.order_type === "COD" ? true : false,
            pickup_postcode: "422010",
          };

          var config = {
            method: "get",
            url: "https://apiv2.shiprocket.in/v1/external/courier/serviceability",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${response.data.token}`,
            },
            data: JSON.stringify(body),
          };
        }

        axios(config)
          .then(async function (response) {
            console.log(response)
            if (response.data.status === 404) {
              await session.abortTransaction()
              session.endSession()
              return res.status(400).send({
                status: "error",
                message: "Cannot deliver to this address.",
              });
            }
            let courier_company;
            response.data.data.available_courier_companies.map(
              (company, index) => {
                if (index == 0) courier_company = company;

                if (courier_company.rate.rate > company.rate.rate)
                  courier_company = company;
              }
            );

            const courier_name = courier_company.courier_name;
            const etd = courier_company.etd;
            const estimated_delivery_days =
              courier_company.estimated_delivery_days;
            const rate = courier_company.rate.rate;

            const cartValueTax = cartValue * 0.12;
            let totalCartValue;
            if (req.body.isInternational) {
              totalCartValue = cartValue + cartValueTax + parseInt(rate);
            } else {
              totalCartValue = cartValue + cartValueTax;
            }
            totalCartValue = Math.round(totalCartValue)

            // -Create order
            // save razorpay order id and amount too
            const order = new Order({
              products: req.body.cart,
              orderType: req.body.order_type,
              shippingDetails: {
                address: req.body.address,
                pincode: req.body.pincode,
                city: req.body.city,
                state: req.body.state,
                country: req.body.country,
                phoneNumber: req.body.phoneNumber,
                firstName: req.body.firstname,
                lastName: req.body.lastname,
                email: req.body.email
              },
              orderStatus: "Initiated",
              orderAmount: totalCartValue,
              cartAmount: cartValue,
              tax: cartValueTax,
              shippingCharges: req.body.isInternational ? rate : 0
            });

            await order.save({session: session});

            const order_items = [];
            req.body.cart.map((item) => {
              order_items.push({
                name: item.product.title,
                sku: `${item.product.SKU}-${item.size}`,
                selling_price:
                  parseInt(item.qty) + parseInt(item.product.price),
                units: item.qty
              });
            });

            if (req.body.order_type === "COD" && !req.body.isInternational) {
              order.orderStatus = "Placed";
              await order.save({session: session});
              req.body.cart.map(async (cartItem, index) => {
                const product = await Product.findById(cartItem.product._id)
                if(!product){
                  console.log("Product not found.")
                }else{
                  product.inventory[cartItem.size] = product.inventory[cartItem.size] - cartItem.qty
                  await product.save()
                }
                
              })

              const currDate = new Date();

              const data = {
                order_id: order._id,
                order_date: `${currDate.getFullYear().toString()}-${currDate.getMonth().toString()}-${currDate.getDate().toString()}`,
                pickup_location: "Primary",
                channel_id: "",
                comment: "",
                billing_customer_name: req.body.firstname,
                billing_last_name: req.body.lastname,
                billing_address: req.body.address,
                billing_address_2: "",
                billing_city: req.body.city,
                billing_pincode: req.body.pincode,
                billing_state: req.body.state,
                billing_country: req.body.country,
                billing_email: req.body.email,
                billing_phone: req.body.phoneNumber,
                shipping_is_billing: true,
                shipping_customer_name: req.body.firstname,
                shipping_last_name: req.body.lastname,
                shipping_address: req.body.address,
                shipping_address_2: "",
                shipping_city: req.body.city,
                shipping_pincode: req.body.pincode,
                shipping_country: req.body.country,
                shipping_state: req.body.state,
                shipping_email: req.body.email,
                shipping_phone: req.body.phoneNumber,
                order_items: order_items,
                payment_method: "COD",
                shipping_charges: 0,
                giftwrap_charges: 0,
                transaction_charges: 0,
                total_discount: 0,
                sub_total: totalCartValue,
                length: 10,
                breadth: 15,
                height: 20,
                weight: totalWeight,
              };
              const result = await axios({
                url: "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${token.toString()}`,
                },
                data: data,
              });

              console.log(result)
              if (result.status !== 200) {
                console.log(result);
                await session.abortTransaction()
                await session.endSession()
                return res.status(400).send({
                  status: "error",
                  message: "Internal server error occurred.",
                });
              }

              //send delivery details with data
              //clear the cart
              await session.commitTransaction()
              await session.endSession()
              return res.status(200).send({
                status: "success",
                data: {
                  courier_name: courier_name,
                  etd: etd,
                  estimated_delivery_days: estimated_delivery_days,
                  rate: req.body.isInternational ? rate : "0",
                },
              });
            } else {
              // -Send initiate payment link
              const orderId = await createOrder(
                totalCartValue,
                order._id.toString()
              );
              order.paymentId = orderId.id;
              await order.save({session: session})
              await session.commitTransaction()
              await session.endSession()
              
              //send delivery data with response
              return res.status(200).send({
                status: "success",
                data: {
                  courier_name: courier_name,
                  etd: etd,
                  estimated_delivery_days: estimated_delivery_days,
                  rate: req.body.isInternational ? rate : "0",
                  paymentId: orderId,
                },
              });
            }
          })
          .catch(async function (error) {
            console.log(error);
            await session.abortTransaction()
            await session.endSession()
            console.log(session)
            return res.status(500).send({
              status: "error",
              error: error.message,
            });
          });
      })
      .catch(async function (error) {
        console.log(error);
        await session.abortTransaction()
        await session.endSession()
        return res.status(500).send({ status: "error", error: error.message });
      });

    // -On successfull payment, comfirm order and send notification to shiprocket
  } catch (e) {
    console.log(e);
    await session.abortTransaction()
    await session.endSession()
    return res.status(400).send({ status: "error", message: e.message });
  }
};

//Razorpay webhook on payment success
const razorpayWebhook = async (req, res) => {
  try {
    const isValidRequest = validateWebhookSignature(JSON.stringify(req.body), req.headers['x-razorpay-signature'], process.env.RAZORPAY_KEY_SECRET)
    if(!isValidRequest){
      console.log("Invalid request")
      return res.status(400).send({message: "Invalid request."})
    }

    const order = await Order.findOne({paymentId: req.body.payload.payment.entity.order_id}).populate({
      path: "products",
      populate: {
        path: "product",
        model: "Product",
      },
    })
    console.log(order)
    if(!order){
      console.log("Order not found: ", req.body)
      return res.status(200).send()
    }

    if(order.orderStatus == "Placed") return res.send()

    order.orderStatus = "Placed"
    await order.save()

    const user = await User.findOne({_id: order.user}).populate({
      path: "cart",
      populate: {
        path: "product",
        model: "Product",
      },
    })
    user.cart.map(async (cartItem, index) => {
      const product = await Product.findById(cartItem.product._id)
      if(!product){
        console.log("Product not found.")
      }else{
        product.inventory[cartItem.size] = product.inventory[cartItem.size] - cartItem.qty
        await product.save()
      }
      
    })

    user.cart = []
    await user.save()
    console.log(user)


    const email = "demo123@demo.com";
    const password = "Passw0rd.";

    //Get shiprocket token
    const loginResult = await axios({
      method: "post",
      url: "https://apiv2.shiprocket.in/v1/external/auth/login",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        email: email,
        password: password,
      }),
    })

    if(loginResult.status !== 200)
    {
      console.log("Failed to login to shiprocket. Order: ", req.body)
      return res.status(200).send()
    }

    const token = loginResult.data.token

    let totalNoOfProducts = 0;
    order.products.map((item) => {
      totalNoOfProducts += item.qty;
    });

    const totalWeight = totalNoOfProducts * 0.3;
    
    const order_items = [];
    order.products.map((item) => {
      order_items.push({
        name: item.product.title,
        sku: `${item.product.SKU}-${item.size}`,
        selling_price: parseInt(item.qty) + parseInt(item.product.price),
        units: item.qty
      });
    });

    const data = {
      order_id: order._id,
      order_date: order.createdAt.toISOString().split("T")[0],
      pickup_location: "Primary",
      channel_id: "",
      comment: "",
      billing_customer_name: order.shippingDetails.firstName,
      billing_last_name: order.shippingDetails.lastName,
      billing_address: order.shippingDetails.address,
      billing_address_2: "",
      billing_city: order.shippingDetails.city,
      billing_pincode: order.shippingDetails.pincode,
      billing_state: order.shippingDetails.state,
      billing_country: order.shippingDetails.country,
      billing_email: order.shippingDetails.email,
      billing_phone: order.shippingDetails.phoneNumber,
      shipping_is_billing: true,
      shipping_customer_name: order.shippingDetails.firstName,
      shipping_last_name: order.shippingDetails.lastName,
      shipping_address: order.shippingDetails.address,
      shipping_address_2: "",
      shipping_city: order.shippingDetails.city,
      shipping_pincode: order.shippingDetails.pincode,
      shipping_country: order.shippingDetails.country,
      shipping_state: order.shippingDetails.state,
      shipping_email: order.shippingDetails.email,
      shipping_phone: order.shippingDetails.phoneNumber,
      order_items: order_items,
      payment_method: "Prepaid",
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: parseFloat(order.orderAmount),
      length: 10,
      breadth: 15,
      height: 20,
      weight: totalWeight,
    };

    //Create order on shiprocket
    const createOrderResult = await axios({
      url: "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token.toString()}`,
      },
      data: data,
    });

    if (createOrderResult.status !== 200) {
      console.log("Failed to create order on shiprocket. Order: ", req.body);
      return res.status(200).send();
    }

    return res.status(200).send()
    //TODO: notify admin
  } catch (error) {
    console.log(error);
    return res.status(400).send({ status: "error", message: error.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      model: "Product",
    });

    if (!user)
      return res
        .status(404)
        .send({ status: "error", message: "User not found" });

    return res.status(200).send({ status: "success", data: user.wishlist });
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

const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();

    return res.status(200).send({ status: "success", data: blogs });
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

const affiliateProgramRegistration = async (req, res) => {
  console.log(req.body)
  try {
    return res.status(200).send({ status: "success", message: "Application submitted successfully!" });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: e.message });
  }
};

//Track order

//Cancel order

module.exports = {
  affiliateProgramRegistration,
  userLogin,
  userRegister,
  getMe,
  googleLogin,
  googleRegister,
  getProducts,
  getProduct,
  addToCart,
  removeFromCart,
  addToWishlist,
  removeFromWishlist,
  checkPincodeAvailability,
  checkInternationalPincodeAvailability,
  placeOder,
  placeGuestOder,
  fetchCartDeliveryOptions,
  getWishlist,
  getCart,
  getBanners,
  updateCart,
  razorpayWebhook,
  getBlogs,
  getIntroBanner,
  placeGuestOder
};
