const express = require("express");
const {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
  getOrderHistory
} = require("../controller/orderController.js");

const router = express.Router();

router.route("/").post(addOrderItems).get(getOrders);
router.route("/history/:id").get(getOrderHistory);
router.route("/mine").get(getMyOrders);
router.route("/:id").get(getOrderById);
router.route("/:id/pay").patch(updateOrderToPaid);
router.route("/:id/deliver").put(updateOrderToDelivered);

module.exports = router;
