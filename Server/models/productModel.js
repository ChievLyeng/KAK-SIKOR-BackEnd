const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true,'Photo is requrie.'],
  },
  // Add other photo-related fields here if necessary
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true,'Product mush have name.'],
      unique: true
    },
    slug: {
      type: String,
      unique: true
    },
    description: {
      type: String,
      required: [true,'Description is require.'],
    },
    price: {
      type: Number,
      required: [true,'Proudct must have price.'],
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: [true,'Category is require.'],
      unique: true
    },
    quantity: {
      type: Number,
      required: [true,'Quantity is require.'],
      min : 1
    },
    photos: [photoSchema],
    Supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true,'Supplier of product is require.'],
      unique: true
    },
    Origin: {
      type: String,
      required: [true,'Product origin is require.'],
      maxlength: [30, "First name cannot exceed 30 characters."],
    },
    Nutrition_Fact: {
      type: String,
      required: [true,'Nutrition fact is require.'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
