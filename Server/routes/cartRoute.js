const express = require("express");
const router = express.Router();
const cartController = require("../controller/cartController.js");

router.post("/cart", cartController.createCart);

router.get("/cart/:userId", cartController.getCartByUserId);

router.put("/cart/:userId", cartController.updateCart);

router.delete("/cart/:userId", cartController.deleteCart);

module.exports = router;
