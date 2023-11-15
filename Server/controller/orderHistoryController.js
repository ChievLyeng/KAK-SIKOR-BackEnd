const OrderHistory = require("../models/orderHistoryModel");

// Create a new order history
const createOrderHistory = async (req, res) => {
  try {
    const { orderId, status, paymentIntent, updateDate } = req.body;
    if (!orderId || !status || !paymentIntent) {
      return res
        .status(400)
        .json({ message: "orderId, status, and paymentIntent are required" });
    }
    const newOrderHistory = new OrderHistory({
      orderId,
      status,
      paymentIntent,
      updateDate,
    });
    const savedOrderHistory = await newOrderHistory.save();

    res.status(201).json({ savedOrderHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all order histories
const getAllOrderHistory = async (req, res) => {
  try {
    const orderHistory = await OrderHistory.find().populate();
    if (!orderHistory || orderHistory.length === 0) {
      return res.status(404).json({ message: "No order history found" });
    }

    res.status(200).json({ orderHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order history by order ID
const getOrderHistoryByOrderId = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    const orderHistory = await OrderHistory.findById(orderId);
    if (!orderHistory) {
      return res
        .status(404)
        .json({ message: `Order history not found with id: ${orderId}` });
    }

    res.status(200).json({ orderHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing order history
const updateOrderHistory = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, paymentIntent } = req.body;
    if (!status || !paymentIntent) {
      return res
        .status(400)
        .json({ message: "Status and paymentIntent are required" });
    }
    const updatedOrderHistory = await OrderHistory.findOneAndUpdate(
      { _id: orderId },
      { $set: { status, paymentIntent } },
      { new: true }
    );
    if (!updatedOrderHistory) {
      return res
        .status(404)
        .json({ message: `Order history not found with id: ${orderId}` });
    }

    res.status(200).json({ updatedOrderHistory });
  } catch (error) {
    res.status(500).json({ error: "Failed to update order history" });
  }
};

// Delete an existing order history
const deleteOrderHistory = async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedOrderHistory = await OrderHistory.deleteOne({ _id: orderId });
    if (deletedOrderHistory.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: `Order history not found with id: ${orderId}` });
    }

    res.status(200).json({ message: "Order history deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrderHistory,
  getAllOrderHistory,
  getOrderHistoryByOrderId,
  updateOrderHistory,
  deleteOrderHistory,
};
