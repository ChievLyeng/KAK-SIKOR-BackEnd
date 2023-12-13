const express = require("express");
const {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
} = require("../controller/orderController.js");

const router = express.Router();

<<<<<<< HEAD
=======
router.route("/").post(addOrderItems).get(getOrders);
router.route("/mine").get(getMyOrders);
router.route("/:id").get(getOrderById);
router.route("/:id/pay").put(updateOrderToPaid);
router.route("/:id/deliver").put(updateOrderToDelivered);

>>>>>>> feature/paymentBackend
module.exports = router;
