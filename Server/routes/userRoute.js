const express = require("express");
const {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  getAllUsers,
  getAllSuppliers,
  deleteUser,
  updateUser,
  updatePassword,
  forgotPassword,
  verifyOTP,
  resetNewPassword,
  logoutUser,
} = require("../controller/userController");
const requireSignIn = require("../middlewares/authMiddleware").requireSignIn;
const passport = require("passport");

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
router.get("/logout/:id", logoutUser);

// Route to initiate Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback route after Google has authenticated the user
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Custom response after successful authentication
    res.send("Successfully logged in with Google!");
  }
);

module.exports = router;
