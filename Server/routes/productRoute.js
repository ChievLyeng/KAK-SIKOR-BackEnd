const express = require("express");
const {
  createProductController,
  getProductController,
  getAllProductsController,
  getProductBySuppplier,
  getPhotoController,
  deleteProductController,
  updateProductController,
} = require("../controller/productController");
const formidable = require("express-formidable");
const { requireSignIn } = require("../middlewares/authMiddleware");
const router = express.Router();
const formOptions = {
  multiples: true,
};

//routes

// Create product router
router.post(
  "/create-product",
  formidable(formOptions),
  createProductController
);

// get product route
router.get("/get-product/:id", getProductController);

// get all products
router.get("/get-all-products", getAllProductsController);

// get photo
router.get("/get-photo/:id", getPhotoController);

//get product by supplier
router.get("/supplier/:id", getProductBySuppplier);

// delete product
router.delete("/delete-product/:id", deleteProductController);

// update product
router.post(
  "/update-product/:id",
  formidable(formOptions),
  updateProductController
);

module.exports = router;
