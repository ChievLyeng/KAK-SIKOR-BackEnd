const express = require("express");
const {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  getAllUsers,
  getAllSuppliers,
  getUserById,
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
const { requireSignIn } = require("../middlewares/authMiddleware");
const passport = require("passport");

const router = express.Router();

// User Routes
router.route("/").get(getAllUsers);
router.route("/suppliers").get(getAllSuppliers);
router.route("/register").post(registerUser);
router
  .route("/:id")
  .put(requireSignIn, updateUser)
  .get(getUserById)
  .delete(requireSignIn, deleteUser);
router.route("/suppliers").get(getAllSuppliers);
router.route("/:id/verify/:token").get(verifyEmail);
router.route("/:id/verify").post(resendVerificationEmail);

// Authentication Routes
router.route("/login").post(loginUser);
router.route("/logout/:id").get(logoutUser);
router.route("/refresh-token").post(refreshToken);

// Password Routes
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-otp").post(verifyOTP);
router.route("/reset-password").post(resetNewPassword);
router.route("/update-password/:id").post(requireSignIn, updatePassword);

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
    // Assuming the authenticated user is stored in req.user
    const { user } = req;

    // Generate and send a token
    createSendToken(user, 200, res);
  }
);

module.exports = router;
