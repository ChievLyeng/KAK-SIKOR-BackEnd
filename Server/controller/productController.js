const { default: slugify } = require("slugify");
const productModel = require("../models/productModel");
const fs = require("fs");
const Supplier = require("../models/supplierModel");

const createProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      quantity,
      shipping,
      Nutrition_Fact,
      Origin,
      Supplier, // Supplier ID directly available in the request body
    } = req.fields;
    const { photo } = req.files;
    const slug = slugify(name);

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !Supplier
    ) {
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
      Nutrition_Fact,
      Origin,
      Supplier, // Assign the Supplier ID directly to the Supplier field
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
        Nutrition_Fact: newProduct.Nutrition_Fact,
        Origin: newProduct.Origin,
        Supplier: newProduct.Supplier,
      },
    });
  } catch (error) {
    console.error("Error in creating product:", error);
    res
      .status(500)
      .json({ error: error, message: "Error in creating product" });
  }
};

// get a single product controller
const getProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id).populate("Supplier");

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
        Nutrition_Fact: product.Nutrition_Fact,
        Origin: product.Origin,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        photo: simplifiedPhotoData,
        Supplier: product.Supplier,
      },
    });
  } catch (error) {
    console.error("Error in fetching product:", error);
    res
      .status(500)
      .json({ error: error, message: "Error in fetching product" });
  }
};

// get all products
const getAllProductsController = async (req, res) => {
  try {
    const productCount = await productModel.countDocuments();
    const products = await productModel
      .find({})
      .populate("category")
      .populate("Supplier")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      result: productCount,
      products: products.map((product) => ({
        _id: product._id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        category: product.category,
        quantity: product.quantity,
        Nutrition_Fact: product.Nutrition_Fact,
        Origin: product.Origin,
        Supplier: product.Supplier,
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

//get Product by supplier
const getProductBySuppplier = async (req, res) => {
  try {
    const { id: supplierID } = req.params;
    console.log("supplierId :", supplierID);

    const products = await productModel
      .find({ Supplier: supplierID })
      .populate("category")
      .populate("Supplier")
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
        Nutrition_Fact: product.Nutrition_Fact,
        Origin: product.Origin,
        Supplier: product.Supplier,
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
  console.log(req.fields);
  try {
    const productId = req.params.id;
    const updatedFields = req.fields; // Contains fields to be updated

    // Check if the product exists
    let product = await productModel.findById(productId).populate("Supplier");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update product details based on received fields
    for (const field in updatedFields) {
      if (Object.prototype.hasOwnProperty.call(updatedFields, field)) {
        if (field === "photo") {
          const photo = req.files && req.files.photo;

          // Check if the photo object and its path property exist before using it
          if (photo && photo.path) {
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
          } else {
            return res.status(400).json({ message: "Invalid photo data" });
          }
        } else {
          product[field] = updatedFields[field];
        }
      }
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
        photo: product.photo,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        Nutrition_Fact: product.Nutrition_Fact,
        Origin: product.Origin,
        Supplier: product.Supplier,
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
  getProductBySuppplier,
  getPhotoController,
  getAllProductsController,
  updateProductController,
};
