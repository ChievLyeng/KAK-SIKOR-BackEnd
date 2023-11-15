const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require("../controller/orderController");

// Create an order
router.post("/create-order", createOrder);

// Get all orders
router.get("/", getAllOrders);

// Get a single order
router.get("/:id", getOrderById);

// Update an order
router.put("/:id", updateOrderStatus);

// Delete an order
router.delete("/:id", deleteOrder);

module.exports = router;
