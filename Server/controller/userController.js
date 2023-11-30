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

// Get All users
const getAllUsers = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const users = await User.find();

    res
      .status(200)
      .json({ status: "success", result: userCount, data: { users } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get all suppliers
const getAllSuppliers = async (req, res) => {
  try {
    const supplierCount = await Supplier.countDocuments({ role: "supplier" });
    const suppliers = await User.find({ role: "supplier" });

    res
      .status(200)
      .json({ status: "success", result: supplierCount, data: { suppliers } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get supplier By Id
const getSuppliersById = async (req, res) => {
  const { id } = req.params;
  try {
    const supplier = await User.findById(id);

    res.status(200).json({ status: "success", data: supplier });
    // console.log(supplier)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params; // Assuming the user ID is passed in the request parameters

    // Find the user by ID and delete it
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", deletedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // Assuming the user ID is passed in the request parameters

    // Exclude email from the fields to be updated
    const { email, ...updateFields } = req.body;

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure email remains unchanged
    updateFields.email = user.email;

    // Update the user's information, excluding email
    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true, // Return the updated user
      runValidators: true, // Run validators to ensure data validity
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getAllSuppliers,
  getSuppliersById,
  updateUser,
  deleteUser,
};
