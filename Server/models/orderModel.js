const mongoose = require("mongoose");
const Product = require("./productModel.js");

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orderItems: [
      // map for each product
      {
        qty: { type: Number, required: [true, "Quantity is require."] },
        photos: [{ type: String, required: [true, "Image is require."] }],
        price: { type: Number, required: [true, "Price is require."] },
        quantity: { type: Number, require: [true, "Quantity is require"] },
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

orderSchema.pre("save", function (next) {
  Promise.all(
    this.orderItems.map(async (item) => {
      if (item.quantity < item.qty)
        throw new AppError("The order quality is exceed stock limited", 400);
      item.quantity -= item.qty;
      const product = await Product.findByIdAndUpdate(item.product, {
        quantity: item.quantity,
      });
      console.log(product);
    })
  );
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
