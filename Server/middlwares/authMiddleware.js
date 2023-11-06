const JWT = require("jsonwebtoken");
const User = require("../models/userModel"); // Assuming you have a User model

// Protected Routes token base
const requireSignIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("Received token:", token);
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = await User.findById(decoded._id);
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  } catch (error) {
    console.error("Error:", error);
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
