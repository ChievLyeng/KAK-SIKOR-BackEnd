const express = require("express");
const {
  registerUser,
  loginUser,
  verifyEmail,
} = require("../controller/userController");
const {
  getAllUsers,
  getAllSuppliers,
  deleteUser,
  updateUser,
} = require("../controller/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getAllUsers);
router.get("/suppliers", getAllSuppliers);
router.delete("/delete/:id", deleteUser);
router.post("/update/:id", updateUser);
router.get("/:id/verify/:token", verifyEmail);

module.exports = router;
