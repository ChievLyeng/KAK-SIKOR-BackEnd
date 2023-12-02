const {
  createCategory,
  updateCategory,
  getAllCategories,
  deleteCategory,
  getSingleCategory,
} = require("../controller/categoryController");

const express = require("express");

const router = express.Router();

//routes
router.route("/catagories").post(createCategory).get(getAllCategories);

router
  .route("category/:slug")
  .put(updateCategory)
  .delete(deleteCategory)
  .get(getSingleCategory);

module.exports = router;