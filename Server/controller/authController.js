const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

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

const saveTokensToDB = async (userId) => {
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
  } catch (error) {
    console.error("Error saving tokens to the database:", error.message);
  }
};

// loginUser function
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user based on the email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Check if the password is correct
    const validPassword = await user.matchPassword(password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if the user is verified
    if (!user.verified) {
      return res.status(400).json({
        message: "Please verify your email before logging in.",
      });
    }

    // Reactivate the account if it was previously deactivated
    if (user.status === "inactive") {
      user.status = "active";

      // Additional check for supplier role to avoid repeated approval
      if (user.role === "supplier" && user.supplierStatus !== "active") {
        user.supplierStatus = "active";
      }

      // Update lastLogin
      user.lastLogin = new Date();
      await user.save();

      return res.status(200).json({
        message: "Your account has been reactivated.",
        token: signToken(user._id),
        user,
      });
    }

    // Check if the user role is "supplier"
    if (user.role === "supplier") {
      // Check if the supplier account is approved by admin
      if (user.supplierStatus !== "active") {
        return res.status(401).json({
          message:
            "Supplier account is not yet approved by admin. Please wait for approval.",
        });
      }
    }

    // Update lastLogin and set status to "active"
    user.lastLogin = new Date();
    user.status = "active";
    await user.save();

    // If verified and approved (for suppliers), use the logInToken function to create the login token
    const token = signToken(user._id);
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//refresh access token
const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is missing" });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    // Update the access token in the database
    const updatedSessionToken = await SessionToken.findOneAndUpdate(
      { userId: decoded.id },
      { accessToken: newAccessToken },
      { new: true } // Return the updated document
    );

    // Log the updated session token for debugging
    console.log("Updated Session Token:", updatedSessionToken);

    // Send the new access token to the client
    res.cookie("accessToken", newAccessToken, { httpOnly: true });
    res.status(200).json({ message: "Access token refreshed successfully" });
  } catch (err) {
    console.error("Refresh Token Error:", err);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};

const createSendToken = async (user, statusCode, res) => {
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
};

const logoutUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Remove the user's session tokens from the database
    await SessionToken.deleteMany({ userId });

    // Clear the access token and refresh token cookies
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
};

module.exports = {
  loginUser,
  signToken,
  signRefreshToken,
  refreshToken,
  createSendToken,
  saveTokensToDB,
  logoutUser,
};
