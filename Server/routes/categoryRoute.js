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
router.post("/catagories", createCategory)
.put("/:slug",updateCategory)
.get("/", getAllCategories)
.delete("/:slug", deleteCategory)
.get("/:slug", getSingleCategory)

module.exports = router;
