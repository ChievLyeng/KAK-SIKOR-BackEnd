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
  .post("/product", formidable(formOptions), createProduct)
  .get("/:id", getProduct)
  .get("/", getAllProducts)
  .get("/:id", getPhoto)
  .get("/:id", getProductBySuppplier)
  .delete("/:id", deleteProduct)
  .post("/:id", formidable(formOptions), updateProduct);

module.exports = router;
