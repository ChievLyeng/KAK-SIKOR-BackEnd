const Order = require("../models/orderModel");

const createOrder = async (req, res) => {
  try {
    const { orderBy, cartItems, paymentMethod, shippingAddress } = req.body;
    if (!orderBy || !cartItems || !paymentMethod || !shippingAddress) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const order = new Order({
      orderBy,
      cartItems,
      paymentMethod,
      shippingAddress,
    });
    await order.save();
    res.status(201).json({ message: "Order Created", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }
    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ message: `Order not found with id: ${req.params.id}` });
    }
    res.status(200).json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { isPaid, isDelivered } = req.body;
    if (!isPaid || !isDelivered) {
      return res
        .status(400)
        .json({ error: "Missing required fields: isPaid and isDelivered" });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { isPaid, isDelivered },
      { new: true }
    );
    if (!order) {
      return res
        .status(404)
        .json({ message: `Order not found with id: ${req.params.id}` });
    }
    res.status(200).json({ message: "Order modified", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

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
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
