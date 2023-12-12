const Order = require("../models/orderModel");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public
const getOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find().populate("user", "name email");
  res.json(orders);
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  res.json(order);
});

// @desc    Create an order
// @route   POST /api/orders
// @access  Public
const createOrder = asyncHandler(async (req, res, next) => {
  const order = new Order(req.body);
  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Update an order to paid
// @route   PUT /api/orders/:id/pay
// @access  Public
const updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.email_address,
  };

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Public
const deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  await order.remove();
  res.json({ message: "Order removed" });
});

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderToPaid,
  deleteOrder,
};
