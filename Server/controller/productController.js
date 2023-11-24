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

  try {
    const uploadResult = await s3.upload(uploadParams).promise();
    return uploadResult.Location; // Return the S3 URL of the uploaded file
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

const createProductController = async (req, res) => {
  try {
    // Destructure fields from the request
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

    // Validate required fields
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

    // Slugify the name for URL-friendly slug
    const slug = slugify(name);

    // Ensure 'photos' is treated as an array
    let photos = req.files.photos;
    if (photos && !Array.isArray(photos)) {
      photos = [photos];
    }

    const photoUrls = [];
    // Process each photo if there are any
    if (photos) {
      for (const photo of photos) {
        const photoUrl = await uploadToS3(photo);
        photoUrls.push({ url: photoUrl });
      }
    }

    // Create new product with the collected data
    const newProduct = new productModel({
      name,
      slug,
      description,
      price,
      category,
      quantity,
      shipping,
      Nutrition_Fact,
      Origin,
      Supplier: Supplier, // Assuming this is an ID or reference to a Supplier document
      photos: photoUrls, // Array of photo URLs
    });

    // Save the new product to the database
    await newProduct.save();

    // Send back a success response
    res.status(201).json({
      message: "Product created successfully",
      success: true,
      product: newProduct,
    });
  } catch (error) {
    console.error("Error in creating product:", error);
    res
      .status(500)
      .json({ message: "Error in creating product", error: error.message });
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

    // Retrieve the product to get the list of photos
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if there are photos to delete
    if (product.photos && product.photos.length) {
      // Create a promise for each delete operation
      const deletePromises = product.photos.map((photo) => {
        const key = photo.url.split("/").pop(); // Extract the key from the URL
        return s3
          .deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          })
          .promise()
          .catch((err) => {
            console.error(`Failed to delete photo with key ${key}:`, err);
            return null; // Return null for any failed delete operation
          });
      });

      // Wait for all delete promises to settle
      const deleteResults = await Promise.all(deletePromises);

      // Filter out any null results (failed deletions)
      const failedDeletes = deleteResults.filter((result) => result === null);
      if (failedDeletes.length > 0) {
        console.warn(`Failed to delete ${failedDeletes.length} photos.`);
        // Optionally handle the failed deletions here
      }
    }

    // Delete the product from the database
    await productModel.findByIdAndDelete(productId);

    res
      .status(200)
      .json({ message: "Product and associated images deleted successfully" });
  } catch (error) {
    console.error("Error in deleting product:", error);
    res
      .status(500)
      .json({ error: error.message, message: "Error in deleting product" });
  }
};

module.exports = deleteProductController;

//update product controller

const updateProductController = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedFields = req.fields; // Contains fields to be updated
    const updatedPhotos = req.files.photos; // Assuming photos are being updated

    // Check if the product exists
    let product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If photos are updated, delete old photos from S3 and upload new ones
    if (updatedPhotos) {
      if (!Array.isArray(updatedPhotos)) {
        updatedPhotos = [updatedPhotos]; // Ensure 'photos' is treated as an array
      }

      // Delete old photos from S3
      if (product.photos && product.photos.length > 0) {
        for (const photo of product.photos) {
          const key = photo.url.split("/").pop(); // Extract the key from the URL
          const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          };
          await s3.deleteObject(deleteParams).promise();
        }
      }

      // Upload new photos to S3
      const photoUrls = [];
      for (const photo of updatedPhotos) {
        const photoUrl = await uploadToS3(photo);
        photoUrls.push({ url: photoUrl });
      }
      product.photos = photoUrls; // Update the photos array in the product document
    }

    // Update other product details based on received fields
    for (const field in updatedFields) {
      if (updatedFields.hasOwnProperty(field) && field !== "photos") {
        product[field] = updatedFields[field];
      }
    }

    // Save the updated product to the database
    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      success: true,
      product: {
        ...product.toObject(), // Convert Mongoose document to a plain object
        photos: product.photos.map((photo) => photo.url), // Map through photos to return only URLs
      },
    });
  } catch (error) {
    console.error("Error in updating product:", error);
    res.status(500).json({
      error: error.message,
      message: "Error in updating product",
    });
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
