const express = require("express");
const { registerUser, loginUser } = require("../controller/userController");
const {
  getAllUsers,
  getAllSuppliers,
  getSuppliersById,
  deleteUser,
  updateUser,
} = require("../controller/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);
router.get("/suppliers", getAllSuppliers);
router.get("/supplier/:id", getSuppliersById);
router.delete("/:id", deleteUser);
router.post("/:id", updateUser);

module.exports = router;
