const { default: slugify } = require("slugify");
const productModel = require("../models/productModel");
const AWS = require("aws-sdk");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const asyncHandler = require("./../utils/asyncHandler");
const AppError = require("./../utils/appError");

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Create a new instance of the S3 class
const s3 = new AWS.S3();

const uploadToS3 = asyncHandler(async (file) => {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${uuidv4()}-${file.name}`, // Unique key for the uploaded file
    Body: fileStream,
  };

  const uploadResult = await s3.upload(uploadParams).promise();
  return uploadResult.Location; // Return the S3 URL of the uploaded file
});

const deletePhotosFromS3 = asyncHandler(async (urls = []) => {
  const deletePromises = urls.map((url) => {
    const Key = url.split("/").slice(-1)[0]; // Extract the object key from the URL
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: Key,
    };
    return s3.deleteObject(params).promise();
  });

  await Promise.all(deletePromises);
  console.log(`Deleted ${urls.length} photo(s) from S3`);
});

const createProduct = asyncHandler(async (req, res, next) => {
  console.log(req.fields);
  console.log(req.files);

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
  if (!name || !description || !price || !category || !quantity || !Supplier) {
    return next(new AppError("All fields must be provided", 404));
  }

  // productModel.collection.dropIndex({ Supplier: 1 }, (err, result) => {
  //   if (err) {
  //     console.error("Error dropping index:", err);
  //   } else {
  //     console.log("Unique index on Supplier dropped successfully");
  //   }
  // });

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
});

// get a single product controller
const getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  // Attempt to find the product by ID, populating the Supplier and category fields if they are references to other schemas
  const product = await productModel
    .findById(id)
    .populate("Supplier")
    .populate("category");

  // If the product is not found, return a 404 error
  if (!product) {
    return next(new AppError("Product Not Found !!"), 404);
  }

  // Function to generate signed URLs for photos of a product
  const generateSignedUrls = async (product) => {
    if (!product.photos || product.photos.length === 0) {
      return [];
    }

    // Generate signed URLs for each photo
    const signedUrls = await Promise.all(
      product.photos.map(async (photo) => {
        const signedUrl = await s3.getSignedUrlPromise("getObject", {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: photo.url.split("/").pop(), // Extract the key from the URL
          Expires: 3600, // URL expiration time in seconds
        });
        return { url: signedUrl, _id: photo._id }; // Return an object with the signed URL and _id
      })
    );

    return signedUrls;
  };

  // Generating signed URLs for photos in the product
  const photoUrls = await generateSignedUrls(product);

  // Construct and send the response object with all necessary fields
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
      photos: photoUrls, // Include the array of signed photo URLs
      Supplier: product.Supplier,
      Nutrition_Fact: product.Nutrition_Fact, // Include the Nutrition_Fact field
      Origin: product.Origin, // Include the Origin field
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      // ... any other fields you want to include ...
    },
  });
});

// get all products
const getAllProducts = asyncHandler(async (req, res) => {
  const productCount = await productModel.countDocuments();
  const products = await productModel
    .find({})
    .populate("category")
    .populate("Supplier")
    .sort({ createdAt: -1 });

  // Function to generate signed URLs for photos of a product
  const generateSignedUrls = async (product) => {
    if (!product.photos || product.photos.length === 0) {
      return [];
    }

    const signedUrls = await Promise.all(
      product.photos.map(async (photo) => {
        const signedUrl = await s3.getSignedUrlPromise("getObject", {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: photo.url.split("/").pop(), // Extract the key from the URL
          Expires: 3600, // URL expiration time in seconds
        });
        return { url: signedUrl, _id: photo._id }; // Return an object with the signed URL and _id
      })
    );

    return signedUrls;
  };

  // Generating signed URLs for photos in each product
  const productsWithSignedUrls = await Promise.all(
    products.map(async (product) => {
      const signedUrls = await generateSignedUrls(product);
      return {
        ...product.toObject(), // Convert product to a plain JS object
        photos: signedUrls, // Replace photos with signed URLs
      };
    })
  );

  res.status(200).json({
    success: true,
    result: productCount,
    products: productsWithSignedUrls,
  });
});

//get Product by supplier
const getProductBySuppplier = asyncHandler(async (req, res) => {
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
});

// Delete product controller
const deleteProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.id;

  // Retrieve the product to get the list of photos
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new AppError("Product not found"), 404);
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
});

//update product controller
const updateProduct = asyncHandler(async (req, res, next) => {
  console.log(req.files);
  console.log(req.fields);
  const { id } = req.params;
  const updateData = req.fields; // Assuming this contains all other product fields to update

  // Fetch the existing product data to get the previous photo URLs
  const existingProduct = await mongoose.model("Product").findById(id);
  const previousPhotos = existingProduct.photos || [];

  // Handle photo updates
  if (req.files && req.files.photos) {
    let photos = req.files.photos;
    // Ensure 'photos' is an array even if only one file is uploaded
    if (!Array.isArray(photos)) {
      photos = [photos];
    }

    // Upload photos to S3 and get their URLs
    const photoUploadPromises = photos.map((photo) => uploadToS3(photo));
    const newPhotoUrls = await Promise.all(photoUploadPromises);

    // Delete previous photos from S3
    await deletePhotosFromS3(previousPhotos.map((photo) => photo.url));

    // Transform URLs into objects according to the photoSchema
    updateData.photos = newPhotoUrls.map((url) => ({ url }));
  }

  // Update the product with the new photo URLs and any other updated fields
  const updatedProduct = await mongoose
    .model("Product")
    .findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

  // If everything goes well, send back the updated product
  res.status(200).json({
    message: "Product updated successfully",
    data: updatedProduct,
  });
});

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  getProductBySuppplier,
  deleteProduct,
  updateProduct,
};
