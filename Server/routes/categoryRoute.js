const {
  createCategoryController,
  updateCategoryController,
  getAllCategoriesController,
  deleteCategoryController,
  getSingleCategoryController,
} = require("../controller/categoryController");

const express = require("express");

const router = express.Router();

//routes

// Create category routes
router.post("/create-category", createCategoryController);

// Update category routes
router.put("/update-category/:slug", updateCategoryController);

// Get all categories routes
router.get("/get-all-categories", getAllCategoriesController);

// Delete category routes
router.delete("/delete-category/:slug", deleteCategoryController);

// get single category routes
router.get("/get-single-category/:slug", getSingleCategoryController);

module.exports = router;
