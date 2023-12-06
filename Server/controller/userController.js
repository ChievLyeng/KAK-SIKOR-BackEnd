const User = require("../models/userModel");
const Supplier = require("../models/supplierModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendVerificationEmail");
const crypto = require("crypto");
const Token = require("../models/tokenModel");
const bcrypt = require("bcryptjs");
const SessionToken = require("../models/sessionModel");
const asyncHandler = require("../utils/asyncHandler");

const registerUser = asyncHandler(async (req, res) => {
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
  } catch (error) {
    handleRegistrationError(error, res);
  }
});

const handleRegistrationError = asyncHandler(async (error, res) => {
  if (error.code === 11000) {
    // Duplicate key error, indicating a duplication of a unique field
    const duplicateField = Object.keys(error.keyPattern)[0];

    if (duplicateField === "email") {
      return res.status(400).json({ error: "Email is already in use." });
    }

    if (duplicateField === "phoneNumber") {
      return res.status(400).json({ error: "Phone number is already in use." });
    }

    // Handle other duplicated fields if needed
    return res.status(400).json({ error: "Duplicate field violation." });
  }

  console.error("User registration error:", error);
  res.status(400).json({ error: "Failed to register user. Please try again." });
});

//Verify Email
const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
      console.error("Invalid user ID");
      return res.status(400).send({ message: "Invalid link" });
    }

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });

    if (!token) {
      console.error("Invalid token");
      return res.status(400).send({ message: "Invalid link" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { verified: true },
      { new: true }
    );

    if (!updatedUser) {
      console.error("Failed to update user verification status");
      return res.status(500).send({ message: "Internal Server Error" });
    }

    // Check if token is defined before calling remove
    if (token && typeof token.remove === "function") {
      await token.remove();
    } else {
      console.error("Token not found or remove method not available");
    }

    console.log("Email verified successfully");
    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify Email Error:", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

// Add this function to your userController.js file
const resendVerificationEmail = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Resend Verification Request for User ID:", id);
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is already verified
    if (user.verified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Check if there's an existing token, and if it's still valid
    const existingToken = await Token.findOne({ userId: user._id });

    if (existingToken && existingToken.createdAt > Date.now() - 60000) {
      return res.status(400).json({
        message:
          "A resend link has been recently sent. Please wait for a minute before requesting again.",
      });
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
  } catch (error) {
    console.error("Resend Verification Email Error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const users = await User.find();

    res
      .status(200)
      .json({ status: "success", result: userCount, data: { users } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const getAllSuppliers = asyncHandler(async (req, res) => {
  try {
    const supplierCount = await Supplier.countDocuments({ role: "supplier" });
    const suppliers = await User.find({ role: "supplier" });

    res
      .status(200)
      .json({ status: "success", result: supplierCount, data: { suppliers } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get supplier By Id
const getSuppliersById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const supplier = await User.findById(id);

    res.status(200).json({ status: "success", data: supplier });
    // console.log(supplier)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// delete user
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Check if the password is provided in the request body
    if (!password) {
      return res.status(400).json({
        error: "Please provide your password to deactivate your account.",
      });
    }

    // Check if the user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the entered password is correct using matchPassword method
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
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
      message:
        "Your account has been deactivated, and you have been logged out.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// update user
const updateUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, ...updateFields } = req.body;

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is attempting to change the email
    if (email && email !== user.email) {
      return res.status(400).json({ error: "Email cannot be changed" });
    }

    // Check if the password field is present in updateFields
    if (password) {
      return res
        .status(400)
        .json({ error: "Password cannot be changed in this route" });
    }

    // Update the user's information, excluding email
    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
