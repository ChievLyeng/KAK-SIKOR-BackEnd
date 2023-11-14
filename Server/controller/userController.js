const User = require("../models/userModel");
const Supplier = require("../models/supplierModel");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.cookie("jwt", token, cookieOptions);

  // remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const registerUser = async (req, res) => {
  try {
    // Check if the supplied fields indicate a supplier
    const isSupplier =
      req.body.farmName ||
      req.body.products ||
      req.body.harvestSchedule ||
      req.body.isOrganic ||
      req.body.supplierStatus;

    // If it's a supplier, set the role to "supplier"
    if (isSupplier) {
      req.body.role = "supplier";
    }

    // Use the appropriate model based on the role
    const userModel = req.body.role === "supplier" ? Supplier : User;

    const newUser = new userModel(req.body);
    const savedUser = await newUser.save();

    // Use the createSendToken function to send the token in the response
    createSendToken(savedUser, 201, res);
  } catch (error) {
    console.error("User registration error:", error);
    res
      .status(400)
      .json({ error: "Failed to register user. Please try again." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists and if the password is correct
    if (user && (await user.matchPassword(password))) {
      // Use the logInToken function to create the login token
      const token = signToken(user._id);
      createSendToken(user, 200, res);
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All users and Suppliers
const getAllUsers = async (req, res) => {
  try {
    const userCount = await User.countDocuments({ role: "user" });
    const users = await User.find({ role: "user" });

    res
      .status(200)
      .json({ status: "success", result: userCount, data: { users } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllSuppliers = async (req, res) => {
  try {
    const supplierCount = await Supplier.countDocuments({ role: "supplier" });
    const suppliers = await Supplier.find({ role: "supplier" });

    res
      .status(200)
      .json({ status: "success", result: supplierCount, data: { suppliers } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser, loginUser, getAllUsers, getAllSuppliers };
