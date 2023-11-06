const { default: slugify } = require("slugify");
const categoryModel = require("../models/categoryModel");

const createCategoryController = async (req, res) => {
  try {
    const { name } = req.fields;
    if (!name) {
      return res.status(401).send({ message: "Name is required" });
    }
    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(200).send({
        success: false,
        message: "Category Already Exisits",
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
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      errro,
      message: "Errro in Category",
    });
  }
};

// Update category
const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    if (!name) {
      return res.status(400).send({ message: "Name is required" });
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
      return res.status(404).send({ message: "Category not found" });
    }

    res.status(200).send({
      message: "Category updated successfully",
      success: true,
      category: updatedCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error while updating category",
    });
  }
};

// Get all categories
const getAllCategoriesController = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    res.status(200).send({
      message: "All categories fetched successfully",
      success: true,
      categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error while fetching categories",
    });
  }
};

//delete categories
const deleteCategoryController = async (req, res) => {
  try {
    const deletedCategory = await categoryModel.findOneAndDelete({
      slug: req.params.slug,
    });

    if (!deletedCategory) {
      return res.status(404).send({ message: "Category not found" });
    }

    res.status(200).send({
      message: "Category deleted successfully",
      success: true,
      category: deletedCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error while deleting category",
    });
  }
};

// Get single category
const getSingleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).send({ message: "Category not found" });
    }

    res.status(200).send({
      message: "Category find successfully",
      success: true,
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error while fetching category",
    });
  }
};

module.exports = {
  createCategoryController,
  updateCategoryController,
  getAllCategoriesController,
  deleteCategoryController,
  getSingleCategoryController,
};
