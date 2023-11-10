const Order = require("../models/orderModel");

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { customer, products, address, status } = req.body;
    const order = new Order({
      customer,
      products,
      address,
      status,
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to create order." });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "username")
      .populate("products.productId", "name");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to get orders." });
  }
};

// Get a single order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "username")
      .populate("products.productId", "name");
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to get order." });
  }
};

// Update an existing order
const updateOrder = async (req, res) => {
  try {
    const { customer, products, address, status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    order.customer = customer;
    order.products = products;
    order.address = address;
    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order." });
  }
};

// Delete an order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    res.json({ message: "Order deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete order." });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
