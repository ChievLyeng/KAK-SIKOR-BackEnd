const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
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
          min: 1,
        },
        totalAmount: {
          type: Number,
        },
      },
    ],
    deliveryAddress: {
      type: String,
      minlength: 8,
      require: true,
    },
    paymentIntent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
