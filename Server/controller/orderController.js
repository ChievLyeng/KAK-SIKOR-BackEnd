const Order = require("../models/orderModel.js");

const asyncHandler = require("../utils/asyncHandler");

// @desc Create new order
// @route POST /api/v1/orders
// @access Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  items = orderItems.map((x) => ({
    ...x,
    product: x._id,
    // _id: undefined,
  }));
  if (orderItems && orderItems.length === 0) {
    res.status(400).send("No order items found");
  } else {
    const order = new Order({
      orderItems: items,
      //user: req.user._id,
      shippingAddress,
      paymentMethod,
      taxPrice,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/v1/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    /*user: req.user._id*/
  }); // we need to store the user data in DB first to make this route work.
  res.status(200).json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  // .populate(
  //   "user",
  //   "firstName lastName email"
  // );

  if (order) {
    res.status(200).json(order);
  } else {
    res.status(404).send("Order not found");
  }
});

const getSupplierOrders = asyncHandler(async (req, res, next) => {
  const supplierOrders = await Order.findById(req.params.id);
  const result = await Order.countDocuments({ id: _id });

  res.status(200).json({
    data: {
      result,
      supplierOrders,
    },
  });
});

// @desc    Update order to paid
// @route   PATCH /api/v1/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, {
    isPaid: true,
    paidAt: Date.now(),
    paymentResult: {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    },
  });
  if (!order) {
    res.status(404).send("Order not found");
  }
  // We Get this from Paypal});

  // const updatedOrder = await order.save();

  res.status(200).json(order);
});

// @desc    Update order to delivered
// @route   PUT /api/v1/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  res.send("Order updated to delivered");
});

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
  const result = await Order.countDocuments();
  const orderCompleted = await Order.countDocuments({ isPaid: true });
  const orderPending = await Order.countDocuments({ isPaid: false });
  const orderDelivered = await Order.countDocuments({ isDelivered: true });
  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .populate({
      path: "user",
      select: "firstName lastName _id",
    })
    .populate({
      path: "orderItems.product",
      select: "name Supplier",
    });
  res.json({
    data: {
      result,
      orderCompleted,
      orderDelivered,
      orderPending,
      orders,
    },
  });
});

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
  getSupplierOrders,
};
