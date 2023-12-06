const express = require("express");
const {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  getAllUsers,
  getAllSuppliers,
  deleteUser,
  updateUser,
} = require("../controller/userController");
const {
  loginUser,
  refreshToken,
  createSendToken,
  logoutUser,
} = require("../controller/authController");
const {
  forgotPassword,
  verifyOTP,
  resetNewPassword,
  updatePassword,
} = require("../controller/passwordController");
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

// Route to trigger token refresh
router.post("/refresh-token", refreshToken);

// Route to initiate Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback route after Google has authenticated the user
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // If authentication is successful, generate and send a token
    const user = req.user; // Assuming the authenticated user is stored in req.user

    // Generate and send a token
    createSendToken(user, 200, res);
  }
);

module.exports = router;
