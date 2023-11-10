const User = require("../models/userModel");
const Supplier = require("../models/supplierModel");

// user registration
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

    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists and if the password is correct
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({ message: "Login successful", user });
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
