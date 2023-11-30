const express = require("express");
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderToPaid,
  deleteOrder,
} = require("../controller/orderController");

// Routes
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id/pay", updateOrderToPaid);
router.delete("/:id", deleteOrder);

module.exports = router;
