const express = require("express");
const {
  createProduct,
  getProduct,
  getAllProducts,
  getProductBySupplier,
  getProductsByCategory,
  deleteProduct,
  updateProduct,
} = require("../controller/productController");
const formidable = require("express-formidable");
const router = express.Router();
const formOptions = {
  multiples: true,
};

//routes

// Create product router
router
  .route("/")
  .post(formidable(formOptions), createProduct)
  .get(getAllProducts);

router
  .route("/:id")
  .get(getProduct)
  .get(getProductsByCategory)
  .delete(deleteProduct)
  .post(formidable(formOptions), updateProduct);

router.get("/supplier/:id", getProductBySupplier);

module.exports = router;
