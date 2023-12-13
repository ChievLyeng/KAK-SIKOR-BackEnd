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
    throw new AppError("Unauthorized: Invalid session token", 401);
  }

  // Check if the user still exists (optional)
  req.user = await User.findById(decoded.id);

  if (!req.user) {
    throw new AppError("User not found", 401);
  }

  const { id } = req.params;

  // Check if the user is authorized to perform the action
  if (req.user._id.toString() !== id.toString()) {
    throw new AppError(
      "Unauthorized: You can only perform this action on your own account",
      403
    );
  }

  next();
});

const requireAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user || user.role !== "admin") {
    throw new AppError(
      "You are not authorized to perform this action. Only admin users can access this feature.",
      401
    );
  }

  next();
});

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };

module.exports = { requireSignIn, requireAdmin, restrictTo };
