const { default: slugify } = require("slugify");
const productModel = require("../models/productModel");
const fs = require("fs");

const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    const slug = slugify(name);

    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newProduct = new productModel({
      name,
      description,
      price,
      category,
      quantity,
      slug,
      shipping,
    });

    if (photo) {
      newProduct.photo.data = fs.readFileSync(photo.path);
      newProduct.photo.contentType = photo.type;
    }

    await newProduct.save();

    // Prepare a simplified response for the photo data
    const simplifiedPhotoData = {
      contentType: newProduct.photo.contentType,
      data: "Photo data has been uploaded successfully",
    };

    res.status(200).json({
      message: "Product created successfully",
      success: true,
      product: {
        shipping: newProduct.shipping,
        _id: newProduct._id,
        name: newProduct.name,
        slug: newProduct.slug,
        description: newProduct.description,
        price: newProduct.price,
        category: newProduct.category,
        quantity: newProduct.quantity,
        photo: simplifiedPhotoData,
        createdAt: newProduct.createdAt,
        updatedAt: newProduct.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in creating product:", error); // Log the specific error message
    res
      .status(500)
      .json({ error: error, message: "Error in creating product" });
  }
};

// get product controller
const getProductController = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await productModel.findOne({ slug });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const simplifiedPhotoData = {
      contentType: product.photo.contentType,
      data: "Photo data has been uploaded successfully",
    };

    res.status(200).json({
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        category: product.category,
        quantity: product.quantity,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        photo: simplifiedPhotoData,
      },
    });
  } catch (error) {
    console.error("Error in fetching product:", error);
    res
      .status(500)
      .json({ error: error, message: "Error in fetching product" });
  }
};

const getAllProductsController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products: products.map((product) => ({
        _id: product._id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        category: product.category,
        quantity: product.quantity,
        photo: {
          contentType: product.photo.contentType,
          data: "Photo data has been uploaded successfully",
        },
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error in fetching all products:", error);
    res
      .status(500)
      .json({ error: error, message: "Error in fetching all products" });
  }
};

// Get photo controller

const getPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (product.photo.data) {
      res.set("Content-Type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error,
      message: "Error while getting photo",
      success: false,
    });
  }
};

// Delete product controller
const deleteProductController = async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if the product exists
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete the product
    await productModel.findByIdAndDelete(productId);

    res
      .status(200)
      .json({ message: "Product deleted successfully", success: true });
  } catch (error) {
    console.error("Error in deleting product:", error);
    res
      .status(500)
      .json({ error: error, message: "Error in deleting product" });
  }
};

//update product controller

const updateProductController = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, category, quantity } = req.fields;
    const { photo } = req.files;

    // Check if the product exists
    let product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update product details
    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    product.quantity = quantity;
    product.slug = slugify(name); // Make sure the slugify function is working properly

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    // Save the updated product
    product = await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        category: product.category,
        quantity: product.quantity,
        photo: product.photo, // Make sure the photo is properly saved
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in updating product:", error);
    res
      .status(500)
      .json({ error: error, message: "Error in updating product" });
  }
};

module.exports = {
  deleteProductController,
  createProductController,
  getProductController,
  getPhotoController,
  getAllProductsController,
  updateProductController,
};
