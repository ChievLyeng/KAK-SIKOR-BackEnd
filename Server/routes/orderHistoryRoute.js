const express = require("express");
const router = express.Router();
const {
  createOrderHistory,
  getAllOrderHistory,
  getOrderHistoryByOrderId,
  updateOrderHistory,
  deleteOrderHistory,
} = require("../controller/orderHistoryController");

// Create order history
router.post("/order-history", createOrderHistory);

// Get all order histories
router.get("/", getAllOrderHistory);

// Get an order history by id
router.get("/:id", getOrderHistoryByOrderId);

// Update an order history by id
router.put("/:id", updateOrderHistory);

// Delete an order history by id
router.delete("/:id", deleteOrderHistory);

module.exports = router;
