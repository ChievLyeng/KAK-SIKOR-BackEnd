const mongoose = require("mongoose");

const orderHistorySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    require: true,
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
    default: "Pending",
  },
  paymentIntent: {
    type: Boolean,
    default: true,
    require: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("OrderHistory", orderHistorySchema);
