const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");
const SessionToken = require("../models/sessionModel");

// Access Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Refresh Token
const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

const saveTokensToDB = asyncHandler(async (userId) => {
  try {
    const accessToken = await signToken(userId);
    const refreshToken = await signRefreshToken(userId);

    const token = new SessionToken({
      userId,
      accessToken,
      refreshToken,
    });

    await token.save();
    console.log("Tokens saved to the database");
    tokensSaved = true;
  } catch (error) {
    console.error("Error saving tokens to the database:", error.message);
  }
});

// loginUser function
const loginUser = asyncHandler(async (req, res) => {
  try {
    console.log("Login user function called");

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const validPassword = await user.matchPassword(password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.verified) {
      return res.status(400).json({
        message: "Please verify your email before logging in.",
      });
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
      return res.status(401).json({
        message:
          "Supplier account is not yet approved by admin. Please wait for approval.",
      });
    }

    user.lastLogin = new Date();
    user.status = "active";
    await user.save();

    const token = signToken(user._id);
    createSendToken(user, 200, res);
  } catch (error) {
    console.error("Login user function error:", error);
    res.status(500).json({ error: error.message });
  }
});

//refresh access token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is missing" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

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
  } catch (err) {
    console.error("Refresh Token Error:", err);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

const createSendToken = asyncHandler(async (user, statusCode, res) => {
  try {
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
  } catch (error) {
    console.error("Error creating and sending tokens:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;

    await SessionToken.deleteMany({ userId });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({
      status: "success",
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
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
