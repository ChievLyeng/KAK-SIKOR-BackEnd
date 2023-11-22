const express = require("express");
const {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
} = require("../controller/userController");
const {
  getAllUsers,
  getAllSuppliers,
  deleteUser,
  updateUser,
  updatePassword,
  forgotPassword,
  verifyOTP,
  resetNewPassword,
} = require("../controller/userController");
const requireSignIn = require("../middlewares/authMiddleware").requireSignIn;

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getAllUsers);
router.get("/suppliers", getAllSuppliers);
router.post("/update/:id", requireSignIn, updateUser);
router.post("/update-password/:id", requireSignIn, updatePassword);
router.delete("/delete/:id", requireSignIn, deleteUser);
router.get("/:id/verify/:token", verifyEmail);
router.post("/resend-verification/:id", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetNewPassword);

module.exports = router;
