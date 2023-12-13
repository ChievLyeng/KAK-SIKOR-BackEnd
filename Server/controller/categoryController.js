const { default: slugify } = require("slugify");
const categoryModel = require("../models/categoryModel");
const asyncHandler = require("./../utils/asyncHandler");
const AppError = require("./../utils/appError");

const createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    return next(new AppError("Name is require.", 400));
  }
  const existingCategory = await categoryModel.findOne({ name });
  if (existingCategory) {
    return res.status(200).send({
      success: false,
      message: "Category Already Exist.",
    });
  }
  const category = await new categoryModel({
    name,
    slug: slugify(name),
  }).save();
  res.status(201).send({
    success: true,
    message: "new category created",
    category,
  });
});

// Update category
const updateCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;

  if (!name) {
    return next(new AppError("Name is require.", 400));
  }

  const updatedCategory = await categoryModel.findByIdAndUpdate(
    id,
    {
      name,
      slug: slugify(name),
    },
    { new: true }
  );

  if (!updatedCategory) {
    return next(new AppError("Category not found.", 404));
  }

  res.status(200).send({
    message: "Category updated successfully",
    success: true,
    category: updatedCategory,
  });
});

// Get all categories
const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await categoryModel.find({});
  res.status(200).send({
    message: "All categories fetched successfully",
    success: true,
    categories,
  });
});

//delete categories
const deleteCategory = asyncHandler(async (req, res, next) => {
  const deletedCategory = await categoryModel.findOneAndDelete({
    slug: req.params.slug,
  });

  if (!deletedCategory) {
    return next(new AppError("Category not found.", 404));
  }

  res.status(200).send({
    message: "Category deleted successfully",
    success: true,
    category: deletedCategory,
  });
});

// Get single category
const getSingleCategory = asyncHandler(async (req, res) => {
  const category = await categoryModel.findOne({ slug: req.params.slug });

  if (!category) {
    return next(new AppError("Category not found.", 404));
  }

  res.status(200).send({
    message: "Category find successfully",
    success: true,
    category,
  });
});

module.exports = {
  createCategory,
  updateCategory,
  getAllCategories,
  deleteCategory,
  getSingleCategory,
};
