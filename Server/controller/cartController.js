const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

exports.getCartByUserId = (req, res) => {
  const userId = req.params.userId;

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
          products: userCart.products,
        },
      });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Error retrieving cart", error: error.message });
    });
};

exports.createCart = (req, res) => {
  const { userId, products } = req.body;

  const newCart = new Cart({ userId, products });

  newCart
    .save()
    .then((cart) => {
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

exports.updateCart = (req, res) => {
  const userId = req.params.userId;
  const updatedCart = req.body;

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

exports.deleteCart = (req, res) => {
  const userId = req.params.userId;

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
