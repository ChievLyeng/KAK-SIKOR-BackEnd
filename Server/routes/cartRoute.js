const express = require("express");
const router = express.Router();
const cartController = require("../controller/cartController.js");

router.post("/", cartController.createCart);
router.get("/:userId", cartController.getCartByUserId);
router.put("/:userId", cartController.updateCart);
router.delete("/:userId", cartController.deleteCart);
module.exports = router;
