const User = require("../models/userModel");
const Supplier = require("../models/supplierModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendVerificationEmail");
const crypto = require("crypto");
const Token = require("../models/tokenModel");
const bcrypt = require("bcryptjs");
const SessionToken = require("../models/sessionModel");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const GlobalErrorHandler = require("../middlewares/globalErrorhandler");

// @desc    Register a new user or supplier
// @route   POST /api/v1/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  try {
    // Determine if the user is a supplier
    const isSupplier =
      req.body.farmName ||
      req.body.products ||
      req.body.harvestSchedule ||
      req.body.isOrganic ||
      req.body.supplierStatus;

    // Set the role based on whether it's a supplier
    const role = isSupplier ? "supplier" : "user";

    // Choose the appropriate model based on the role
    const userModel = role === "supplier" ? Supplier : User;

    // Create a new user instance
    const newUser = new userModel({
      ...req.body,
      role,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Generate a verification token
    const token = await new Token({
      userId: savedUser._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    // Construct the verification URL
    const verificationURL = `${process.env.BASE_URL}/users/${savedUser._id}/verify/${token.token}`;

    // Send verification email
    await sendEmail(savedUser.email, "Verify Email", verificationURL);

    // Respond with a message to verify email
    res.status(201).json({
      message:
        "An email has been sent to your account. Please verify your email before logging in.",
    });
  } catch (err) {
    GlobalErrorHandler(err, req, res);
  }
});

// @desc    Verify user's email
// @route   GET /api/v1/users/:id/verify/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ _id: req.params.id });

  if (!user) {
    console.error("Invalid user ID");
    return next(new AppError("Invalid link", 400));
  }

  const token = await Token.findOne({
    userId: user._id,
    token: req.params.token,
  });

  if (!token) {
    console.error("Invalid token");
    return next(new AppError("Invalid link", 400));
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id },
    { verified: true },
    { new: true }
  );

  if (!updatedUser) {
    console.error("Failed to update user verification status");
    return next(new AppError("Internal Server Error", 500));
  }

  // Check if token is defined before calling remove
  if (token && typeof token.remove === "function") {
    await token.remove();
  } else {
    console.error("Token not found or remove method not available");
  }

  console.log("Email verified successfully");
  res.status(200).send({ message: "Email verified successfully" });
});

// @desc    Resend verification email
// @route   POST /api/v1/users/:id/verify
// @access  Public
const resendVerificationEmail = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if the user is already verified
  if (user.verified) {
    return next(new AppError("User is already verified", 400));
  }

  // Check if there's an existing token, and if it's still valid
  const existingToken = await Token.findOne({ userId: user._id });

  if (existingToken && existingToken.createdAt > Date.now() - 60000) {
    return next(
      new AppError(
        "Resend link recently sent. Please wait for a minute before requesting again.",
        400
      )
    );
  }

  // Generate a new verification token
  const newToken = await new Token({
    userId: user._id,
    token: crypto.randomBytes(32).toString("hex"),
  }).save();

  // Construct the new verification URL
  const verificationURL = `${process.env.BASE_URL}/users/${user._id}/verify/${newToken.token}`;

  // Send the new verification email
  await sendEmail(user.email, "Resend Verification Email", verificationURL);

  res.status(200).json({ message: "Resend link sent successfully" });
});

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Public
const getAllUsers = asyncHandler(async (req, res, next) => {
  const userCount = await User.countDocuments();
  const users = await User.find();

  if (!userCount || !users) {
    return next(new AppError("Failed to fetch user data", 500));
  }

  res
    .status(200)
    .json({ status: "success", result: userCount, data: { users } });
});

// @desc    Get all suppliers
// @route   GET /api/v1/users/suppliers
// @access  Public
const getAllSuppliers = asyncHandler(async (req, res, next) => {
  const supplierCount = await Supplier.countDocuments({ role: "supplier" });
  const suppliers = await User.find({ role: "supplier" });

  if (!supplierCount || !suppliers) {
    return next(new AppError("Failed to fetch supplier data", 500));
  }

  res
    .status(200)
    .json({ status: "success", result: supplierCount, data: { suppliers } });
});

// @desc    Get supplier by ID
// @route   GET /api/v1/users/suppliers/:id
// @access  Public
const getSuppliersById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const supplier = await User.findById(id);

  if (!supplier) {
    return next(new AppError("Supplier not found.", 404));
  }

  res.status(200).json({ status: "success", data: supplier });
});

// @desc    Delete user account
// @route   DELETE /api/v1/users/:id
// @access  Private (requires authentication)
const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;

  // Check if the password is provided in the request body
  if (!password) {
    return next(
      new AppError(
        "Please provide your password to deactivate your account.",
        400
      )
    );
  }

  // Check if the user exists
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  // Check if the entered password is correct using matchPassword method
  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    return next(new AppError("Invalid password.", 401));
  }

  // Soft delete: Set the user status to "inactive" instead of removing from the database
  user.status = "inactive";
  user.supplierStatus = "inactive";

  // Remove the user's session tokens from the database
  await SessionToken.deleteMany({ userId: user._id });

  // Save the user
  await user.save();

  // Clear the access token and refresh token cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({
    message: "Your account has been deactivated, and you have been logged out.",
  });
});

// @desc    Update user information
// @route   PUT /api/v1/users/:id
// @access  Private (requires authentication)
const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { email, password, ...updateFields } = req.body;

  // Find the user by ID
  const user = await User.findById(id);

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  // Check if the user is attempting to change the email
  if (email && email !== user.email) {
    return next(new AppError("Email cannot be changed.", 400));
  }

  // Check if the password field is present in updateFields
  if (password) {
    return next(new AppError("Password cannot be changed in this route.", 400));
  }

  // Update the user's information, excluding email
  const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return next(new AppError("User not found.", 404));
  }

  res.status(200).json({ message: "User updated successfully", updatedUser });
});

module.exports = {
  registerUser,
  getAllUsers,
  getAllSuppliers,
  getSuppliersById,
  updateUser,
  deleteUser,
  verifyEmail,
  resendVerificationEmail,
};
