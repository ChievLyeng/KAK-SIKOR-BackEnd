const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const orderController = require("../controller/orderController.js");

// Routes
router.get("/", orderController.getOrders);
router.get("/:id", orderController.getOrderById);
router.post("/", orderController.createOrder);
router.put("/:id/pay", orderController.updateOrderToPaid);
router.delete("/:id", orderController.deleteOrder);
=======
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
>>>>>>> feature/adminBackoffice

module.exports = router;
