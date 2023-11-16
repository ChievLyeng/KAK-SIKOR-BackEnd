const Order = require("../models/orderModel");

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { orderBy, products, deliveryAddress, paymentIntent, status } =
      req.body;
    if (!orderBy || !products || !deliveryAddress) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const order = new Order({
      orderBy,
      products,
      deliveryAddress,
      paymentIntent,
      status,
    });
    await order.save();
    res.status(201).json({ message: "Order Created", order });
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find(req.body);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Get an order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("paymentIntent");
    if (!order) {
      return res
        .status(404)
        .json({ message: `Order not found with id: ${req.params.id}` });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

// Update an order
const updateOrderStatus = async (req, res) => {
  try {
    const { paymentIntent, status } = req.body;
    if ((!status, !paymentIntent)) {
      return res
        .status(400)
        .json({ error: "Missing required field: status and paymentIntent" });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentIntent, status },
      { new: true }
    );
    if (!order) {
      return res
        .status(404)
        .json({ message: `Order not found with id: ${req.params.id}` });
    }

    res.status(200).json({ message: "Order modified", order });
  } catch (error) {
    res.status(500).json({ error: "Failed to update order" });
  }
};

// Delete an order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ message: `Order not found with id: ${req.params.id}` });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete order" });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
