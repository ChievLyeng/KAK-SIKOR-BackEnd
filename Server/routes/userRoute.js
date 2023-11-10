const express = require("express");
const { registerUser, loginUser } = require("../controller/userController");
const {
  getAllUsers,
  getAllSuppliers,
} = require("../controller/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getAllUsers);
router.get("/suppliers", getAllSuppliers);

module.exports = router;
