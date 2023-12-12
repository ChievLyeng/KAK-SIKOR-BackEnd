const JWT = require("jsonwebtoken");
const User = require("../models/userModel");
const SessionToken = require("../models/sessionModel");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

// Protected Routes token base
const requireSignIn = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  // Verify the token
  const decoded = JWT.verify(token, process.env.JWT_SECRET);

  // Check if the user's session token exists in the database
  const sessionToken = await SessionToken.findOne({
    userId: decoded.id,
    accessToken: token,
  });

  if (!sessionToken) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid session token" });
  }

  // Check if the user still exists (optional)
  req.user = await User.findById(decoded.id);

  if (!req.user) {
    return res.status(401).json({ error: "User not found" });
  }

  const { id } = req.params;

  // Check if the user is authorized to perform the action
  if (req.user._id.toString() !== id.toString()) {
    return res.status(403).json({
      error:
        "Unauthorized: You can only perform this action on your own account",
    });
  }

  next();
});

const requireAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user || user.role !== "admin") {
    return res.status(401).json({
      error:
        "You are not authorized to perform this action. Only admin users can access this feature.",
    });
  }

  const { id } = req.params;

  // Check if the user is authorized to perform the action
  if (req.user._id.toString() !== id.toString()) {
    throw new AppError(
      "Unauthorized: You can only perform this action on your own account",
      403
    );
  }
});

module.exports = { requireSignIn, requireAdmin };
