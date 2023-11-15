const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

// Get a user's cart by userId
exports.getCartByUserId = (req, res) => {
  const userId = req.params.userId;

  // Add authorization check if needed

  Cart.findOne({ userId })
    .populate([
      {
        path: "products.productId",
        model: "Product",
      },
      {
        path: "userId",
        model: "User",
      },
    ])
    .exec()
    .then((userCart) => {
      if (!userCart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      // The CartSchema pre-save hook already calculates unitPrice and totalAmount,
      // so you can use these values directly from the database

      const { _id, username, email, phoneNumber, birthdate, gender } =
        userCart.userId;

      res.status(200).json({
        _id,
        username,
        email,
        phoneNumber,
        birthdate,
        gender,
        cart: {
          userId: userCart.userId._id,
          products: userCart.products, // This will include unitPrice and totalAmount
        },
      });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Error retrieving cart", error: error.message });
    });
};

// Create a new cart
exports.createCart = (req, res) => {
  const { userId, products } = req.body;

  // Add validation to check if userId and products are valid

  // Create a new cart instance
  const newCart = new Cart({ userId, products });

  newCart
    .save()
    .then((cart) => {
      // Include additional user information
      const { _id, username, email, phoneNumber, birthdate, gender } =
        cart.userId;

      res
        .status(201)
        .json({ _id, username, email, phoneNumber, birthdate, gender, cart });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Error creating a cart", error: error.message });
    });
};

// Update the cart for a user
exports.updateCart = (req, res) => {
  const userId = req.params.userId;
  const updatedCart = req.body;

  // Add authorization check if needed

  Cart.findOneAndUpdate({ userId }, updatedCart, { new: true })
    .populate([
      {
        path: "products.productId",
        model: "Product",
      },
      {
        path: "userId",
        model: "User",
      },
    ])
    .exec()
    .then((cart) => {
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      // The CartSchema pre-save hook already calculates unitPrice and totalAmount,
      // so you can use these values directly from the database

      const { _id, username, email, phoneNumber, birthdate, gender } =
        cart.userId;

      res
        .status(200)
        .json({ _id, username, email, phoneNumber, birthdate, gender, cart });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Error updating cart", error: error.message });
    });
};

// Delete a user's cart by userId
exports.deleteCart = (req, res) => {
  const userId = req.params.userId;

  // Add authorization check if needed

  Cart.findOneAndDelete({ userId })
    .populate("userId", "username email phoneNumber birthdate gender")
    .exec()
    .then((cart) => {
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const { _id, username, email, phoneNumber, birthdate, gender } =
        cart.userId;

      res.status(200).json({
        _id,
        username,
        email,
        phoneNumber,
        birthdate,
        gender,
        message: "Cart deleted successfully",
      });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Error deleting cart", error: error.message });
    });
};
