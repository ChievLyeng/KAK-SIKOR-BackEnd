const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

// Calculate the unitPrice and totalAmount for each product in the cart
// Update the total field with the sum of totalAmount from all products
CartSchema.pre("save", async function (next) {
  try {
    const products = this.products;

    let cartTotal = 0; // Initialize cart total

    for (const productItem of products) {
      const product = await mongoose
        .model("Product")
        .findById(productItem.productId);

      if (product) {
        productItem.unitPrice = product.cost;
        productItem.totalAmount = product.cost * productItem.quantity;
        cartTotal += productItem.totalAmount; // Update cart total
      }
    }

    this.total = cartTotal; // Update the cart's total field

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Cart", CartSchema);
