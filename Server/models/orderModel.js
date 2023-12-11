const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orderItems: [
      {
        qty: { type: Number, required: [true, "Quantity is require."] },
        photos: [{ type: String, required: [true, "Image is require."] }],
        price: { type: Number, required: [true, "Price is require."] },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: [true, "Product is require."],
          ref: "Product",
        },
      },
    ],
    shippingAddress: {
      address: {
        type: String,
        required: [true, "Deliver address is require."],
      },
      city: { type: String, required: [true, "City is require."] },
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is require."],
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: {
      type: Number,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
