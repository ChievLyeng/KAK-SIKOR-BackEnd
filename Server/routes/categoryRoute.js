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
router.route("/").post(createCategory).get(getAllCategories);

router
  .route("/:slug")
  .put(updateCategory)
  .delete(deleteCategory)
  .get(getSingleCategory);

module.exports = router;
