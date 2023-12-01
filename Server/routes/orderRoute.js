const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController.js");

// Routes
router.get("/", orderController.getOrders);
router.get("/:id", orderController.getOrderById);
router.post("/", orderController.createOrder);
router.put("/:id/pay", orderController.updateOrderToPaid);
router.delete("/:id", orderController.deleteOrder);

module.exports = router;
