const express = require("express");
const checkAuth = require("../middleware/checkAuth.middlewares");
const adminController = require("../controllers/admin.controllers");
const router = express.Router();
const multer = require("multer");
const categoryController = require("../controllers/category.controllers");
const colorController = require("../controllers/color.controllers");
const productController = require("../controllers/product.controllers");
const collectionsController = require("../controllers/collection.controllers");
const inventoryController = require("../controllers/inventory.controllers");
const couponController = require("../controllers/coupon.controllers");

// var upload = multer({
//   //   storage: storage,
//   fileFilter: (req, file, cb) => {
//     if (
//       file.mimetype == "image/png" ||
//       file.mimetype == "image/jpg" ||
//       file.mimetype == "image/jpeg"
//     ) {
//       cb(null, true);
//     } else {
//       cb(null, false);
//       return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
//     }
//   },
// });
router.get("/users", adminController.getUsers);

router.get("/products", productController.getProducts);
router.get("/product/:slug", productController.getProduct);
router.post("/product", productController.createProduct);
router.patch("/product/:slug", productController.updateProduct);
router.delete("/product/:id", productController.deleteProduct);

router.get("/inventory", inventoryController.getInventory);
router.post("/inventory", inventoryController.createInventory);
router.patch("/inventory/:id", inventoryController.updateInventory);
router.delete("/inventory/:id", inventoryController.deleteInventory);

router.get("/categories", categoryController.getCategories);
router.post("/category", categoryController.createCategory);
router.patch("/category/:id", categoryController.updateCategory);
router.delete("/category/:id", categoryController.deleteCategory);

router.get("/collections", collectionsController.getCollections);
router.post("/collection", collectionsController.createCollection);
router.patch("/collection/:id", collectionsController.updateCollection);
router.delete("/collection/:id", collectionsController.deleteCollection);

router.get("/colors", checkAuth, colorController.getColors);
router.post("/color", checkAuth, colorController.createColor);
router.patch("/color/:id", checkAuth, colorController.updateColor);
router.delete("/color/:id", checkAuth, colorController.deleteColor);

//get orders
router.get("/orders", productController.getOrders);
router.get("/order/:id", productController.getOrder);

router.get("/user/orders/:id", adminController.getUserOrders);

//get payments

//get users
//delete users

router.post("/uploadImage", adminController.uploadImage);

router.get("/banners", adminController.getBanners);

router.post("/banner", adminController.createBanner);

router.delete("/banner/:id", adminController.deleteBanner);

router.get("/blogs", adminController.getBlogs);

router.get("/blog/:id", adminController.getBlog);

router.post("/blog", adminController.createBlog);

router.patch("/blog/:id", adminController.updateBlog);

router.delete("/blog/:id", adminController.deleteBlog);

router.get("/introBanner", adminController.getIntroBanner);

router.post("/introBanner", adminController.createIntroBanner);

router.patch("/introBanner/:id", adminController.updateIntroBanner);

//Coupons

router.get("/coupons",couponController.getCoupons);

router.get("/coupon/:id", couponController.getCoupon);

router.post("/coupon", couponController.createCoupon);

router.patch("/coupon/:id", couponController.updateCoupon);

router.delete("/coupon/:id", couponController.deleteCoupon);

module.exports = router;
