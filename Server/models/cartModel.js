const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
          required: [true, "Quantity is needed"],
        },
        unitPrice: {
          type: Number, // Add unitPrice field
        },
        totalAmount: {
          type: Number, // Add totalAmount field
        },
      },
    ],
    total: {
      type: Number, // Add a field for the total amount of the entire cart
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);