const mongoose = require("mongoose");

const orderHistorySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
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
      "completed",
      "cancelled",
      "refunded",
    ],
    default: "completed",
  },
});

module.exports = mongoose.model("OrderHistory", orderHistorySchema);
