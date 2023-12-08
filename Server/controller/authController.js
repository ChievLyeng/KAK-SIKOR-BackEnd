const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");
const SessionToken = require("../models/sessionModel");
const AppError = require("../utils/appError");

// @desc    Sign JWT token for access
// @param   {string} id - User ID
// @return  {string} Signed JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Sign JWT token for refresh
// @param   {string} id - User ID
// @return  {string} Signed JWT refresh token
const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

// @desc    Save access and refresh tokens to the database
// @param   {string} userId - User ID
const saveTokensToDB = asyncHandler(async (userId) => {
  const accessToken = await signToken(userId);
  const refreshToken = await signRefreshToken(userId);

  const token = new SessionToken({
    userId,
    accessToken,
    refreshToken,
  });

  await token.save();
  console.log("Tokens saved to the database");

  // Return the success status
  return true;
});

// @desc    Log in a user
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User not found", 401));
  }

  const validPassword = await user.matchPassword(password);
  if (!validPassword) {
    return next(new AppError("Invalid email or password", 401));
  }

  if (!user.verified) {
    return next(
      new AppError("Please verify your email before logging in.", 400)
    );
  }

  if (user.status === "inactive") {
    user.status = "active";

    if (user.role === "supplier" && user.supplierStatus !== "active") {
      user.supplierStatus = "active";
    }

    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      message: "Your account has been reactivated.",
      token: signToken(user._id),
      user,
    });
  }

  if (user.role === "supplier" && user.supplierStatus !== "active") {
    return next(
      new AppError(
        "Supplier account is not yet approved by admin. Please wait for approval.",
        401
      )
    );
  }

  user.lastLogin = new Date();
  user.status = "active";
  await user.save();

  const token = signToken(user._id);
  createSendToken(user, 200, res, next);
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw new AppError("Refresh token is missing", 401);
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // Check if the session token exists before updating
  const existingSessionToken = await SessionToken.findOne({
    userId: decoded.id,
  });

  if (existingSessionToken) {
    const updatedSessionToken = await SessionToken.findOneAndUpdate(
      { userId: decoded.id },
      { accessToken: newAccessToken },
      { new: true }
    );

    console.log("Updated Session Token:", updatedSessionToken);
  } else {
    console.log("Session Token not found for user:", decoded.id);
  }

  res.cookie("accessToken", newAccessToken, { httpOnly: true });
  res.status(200).json({ message: "Access token refreshed successfully" });
});

// @desc    Create and send access and refresh tokens
// @route   Private (used internally)
const createSendToken = asyncHandler(async (user, statusCode, res, next) => {
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Store tokens in the database
  await saveTokensToDB(user._id, token, refreshToken);

  // Log the token for debugging purposes
  console.log("Setting accessToken cookie:", token);

  // Set the accessToken cookie
  res.cookie("accessToken", token, { httpOnly: true });

  // Set the refreshToken cookie
  res.cookie("refreshToken", refreshToken, { httpOnly: true });

  // remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    refreshToken,
    data: {
      user,
    },
  });
});

// @desc    Logout user and clear tokens
// @route   DELETE /api/v1/users/logout/:id
// @access  Private (requires authentication)
const logoutUser = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  console.log("refreshToken:", refreshToken);

  const session = await SessionToken.findOneAndDelete({ refreshToken });
  if (session) {
    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
  }

  // Log the userId to check if it's received correctly

  // Delete session data from the database

  // Send a successful JSON response
  res.status(200).json({
    status: "success",
    message: "User logged out successfully",
  });
});

module.exports = {
  loginUser,
  signToken,
  signRefreshToken,
  refreshToken,
  createSendToken,
  saveTokensToDB,
  logoutUser,
};
