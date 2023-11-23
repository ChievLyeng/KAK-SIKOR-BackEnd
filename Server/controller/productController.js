const { default: slugify } = require("slugify");
const productModel = require("../models/productModel");
const Supplier = require("../models/supplierModel");
const AWS = require("aws-sdk");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Create a new instance of the S3 class
const s3 = new AWS.S3();

const uploadToS3 = async (file) => {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${uuidv4()}-${file.name}`, // Unique key for the uploaded file
    Body: fileStream,
  };

  const uploadResult = await s3.upload(uploadParams).promise();
  return uploadResult.Location; // Return the S3 URL of the uploaded file
};

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
      Supplier,
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

    // Upload photo to S3
    const photoUrl = await uploadToS3(photo);

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
      Supplier,
      photo: {
        url: photoUrl, // Storing the S3 URL of the photo
      },
    });

    await newProduct.save();

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
        photo: photoUrl,
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
      data: "Photo data has been uploaded successfully 222",
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
        photo: product.photo.url, // Assuming the URL is stored in 'url' field
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
    const { id } = req.params;
    const product = await productModel.findById(id);

    if (!product || !product.photo || !product.photo.url) {
      return res
        .status(404)
        .json({ message: "Photo not found", success: false });
    }

    const photoUrl = product.photo.url;

    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: photoUrl.split("/").slice(-1)[0],
      Expires: 3600, // Expiration time for the signed URL in seconds (adjust as needed)
    };

    const signedUrl = await s3.getSignedUrlPromise("getObject", s3Params);

    res.status(200).json({ success: true, photo: { signedUrl } });
  } catch (error) {
    console.error("Error while getting photo:", error);
    res.status(500).json({
      error: error.message,
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

    // Delete the product's image from S3
    const photoUrl = product.photo.url;
    const key = photoUrl.split("/").slice(-1)[0]; // Extract the key from the URL

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    // Delete image from S3
    await s3.deleteObject(deleteParams).promise();

    // Delete the product
    await productModel.findByIdAndDelete(productId);

    res
      .status(200)
      .json({
        message: "Product and associated image deleted successfully",
        success: true,
      });
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
