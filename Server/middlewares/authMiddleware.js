const JWT = require("jsonwebtoken");
const User = require("../models/userModel");
const SessionToken = require("../models/sessionModel");

// Protected Routes token base
const requireSignIn = async (req, res, next) => {
  try {
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
      console.log("User not found");
      return res.status(401).json({ error: "User not found" });
    }

    const id = req.params.id;

    // Check if the user is authorized to perform the action
    if (req.user._id.toString() !== id.toString()) {
      return res.status(403).json({
        error:
          "Unauthorized: You can only perform this action on your own account",
      });
    }

    next();
  } catch (error) {
    console.error("Error in requireSignIn:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== "admin") {
      return res.status(401).json({
        error:
          "You are not authorized to perform this action. Only admin users can access this feature.",
      });
    }
    next();
  } catch (error) {
    console.error("Error in requireAdmin:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { requireSignIn, requireAdmin };
