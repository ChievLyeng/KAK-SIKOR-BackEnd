const JWT = require("jsonwebtoken");
const User = require("../models/userModel"); // Assuming you have a User model

// Protected Routes token base
const requireSignIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id); // Updated to use 'id' instead of '_id'
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
