const Cart = require("../models/cartModel.js");

// Create a new cart
exports.createCart = (req, res) => {
  const { userId, products } = req.body;

  // Create a new cart instance
  const newCart = new Cart({ userId, products });

  newCart
    .save()
    .then((cart) => {
      res.status(201).json(cart);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Error creating a cart", error: error.message });
    });
};

// Get a user's cart by userId
exports.getCartByUserId = (req, res) => {
  const userId = req.params.userId;

  Cart.findOne({ userId })
    .then((cart) => {
      if (cart) {
        res.status(200).json(cart);
      } else {
        res.status(404).json({ message: "Cart not found" });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Error retrieving cart", error: error.message });
    });
};

// Update the cart for a user
exports.updateCart = (req, res) => {
  const userId = req.params.userId;
  const updatedCart = req.body;

  Cart.findOneAndUpdate({ userId }, updatedCart, { new: true })
    .then((cart) => {
      if (cart) {
        res.status(200).json(cart);
      } else {
        res.status(404).json({ message: "Cart not found" });
      }
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

  Cart.findOneAndDelete({ userId })
    .then(() => {
      res.status(200).json({ message: "Cart deleted successfully" });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Error deleting cart", error: error.message });
    });
};
