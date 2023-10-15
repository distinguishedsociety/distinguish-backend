const express = require("express");
const checkAuth = require("../middleware/checkAuth.middlewares");
const userControllers = require("../controllers/users.controllers");
const router = express.Router();

router.post("/signup", userControllers.userRegister);
router.post("/login", userControllers.userLogin);
router.post("/googleLogin", userControllers.googleLogin);
router.post("/googleRegister", userControllers.googleRegister);
router.get("/me", checkAuth, userControllers.getMe);
router.get("/products", userControllers.getProducts);
router.get("/products/:slug", userControllers.getProduct);
router.post("/addToCart", checkAuth, userControllers.addToCart);
router.post("/removeFromCart", checkAuth, userControllers.removeFromCart);
router.post("/addToWishlist", checkAuth, userControllers.addToWishlist);
router.post(
  "/removeFromWishlist",
  checkAuth,
  userControllers.removeFromWishlist
);
//Check Pincode Availability
router.post(
  "/checkPincodeAvailability",
  checkAuth,
  userControllers.checkPincodeAvailability
);

//Check International Pincode Availability
router.post(
  "/checkInternationalPincodeAvailability",
  checkAuth,
  userControllers.checkInternationalPincodeAvailability
);

//Fetch cart delivery options
router.post(
  "/fetchCartDeliveryOptions",
  userControllers.fetchCartDeliveryOptions
);

router.post("/paymentWebhook", userControllers.razorpayWebhook);

//Place order
router.post("/placeOrder", checkAuth, userControllers.placeOder);
router.post("/placeGuestOrder" , userControllers.placeGuestOder);

router.post("/placeGuestOrder", checkAuth, userControllers.placeGuestOder);

router.get("/wishlist", checkAuth, userControllers.getWishlist);

router.get("/cart", checkAuth, userControllers.getCart);

router.post("/updateCart", checkAuth, userControllers.updateCart);
//initiate payment

router.get("/banners", userControllers.getBanners);

router.get("/blogs", userControllers.getBlogs);

router.get("/introBanner", userControllers.getIntroBanner);

router.post("/affiliateProgramRegistration", userControllers.affiliateProgramRegistration);

module.exports = router;
