const express = require("express");
const {
  createProductController,
  getProductController,
  getAllProductsController,
  getPhotoController,
  deleteProductController,
  updateProductController,
} = require("../controller/productController");
const formidable = require("express-formidable");
const { requireSignIn } = require("../middlwares/authMiddleware");
const router = express.Router();

//routes

// Create product router
router.post(
  "/create-product",
  formidable(),
  requireSignIn,
  createProductController
);

// get product route
router.get("/get-product/:slug", formidable(), getProductController);

// get product route
router.get("/get-all-products", getAllProductsController);

// get photo
router.get("/get-photo/:id", getPhotoController);

// delete product
router.delete("/delete-product/:id", deleteProductController);

// update product
router.post("/update-product/:id", formidable(), updateProductController);

module.exports = router;
