const express = require("express");
const {
  createProduct,
  getProduct,
  getAllProducts,
  getProductBySuppplier,
  getPhoto,
  deleteProduct,
  updateProduct,
} = require("../controller/productController");
const formidable = require("express-formidable");
const { requireSignIn } = require("../middlewares/authMiddleware");
const router = express.Router();
const formOptions = {
  multiples: true,
};

//routes

// Create product router
router
  .route("/products")
  .post(formidable(formOptions), createProduct)
  .get(getAllProducts);

router
  .route("/product/:id")
  .get(getProduct)
  .get(getPhoto)
  .get(getProductBySuppplier)
  .delete(deleteProduct)
  .post(formidable(formOptions), updateProduct);

module.exports = router;
