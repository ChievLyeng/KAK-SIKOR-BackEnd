const mongoose = require("mongoose");

const orderHistorySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  orderItems: [
    {
      productCartId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "cartItems",
      },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      photo: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
    default: 0.0,
  },
  isPaid: {
    type: Boolean,
    default: true,
    required: true,
  },
  isDelivered: {
    type: Boolean,
    default: true,
    required: true,
  },
  orderDate: {
    type: Date,
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
    default: "delivered",
  },
});

module.exports = mongoose.model("OrderHistory", orderHistorySchema);
