const User = require("../models/userModel");
const Supplier = require("../models/supplierModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const Token = require("../models/tokenModel");

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

    // // Check if the user has already requested to resend the verification link
    // const existingToken = await Token.findOne({ userId: savedUser._id });

    // // If there's an existing token, check if it's still valid
    // if (existingToken && existingToken.createdAt > Date.now() - 60000) {
    //   // If the token is still valid, return a message indicating the need to wait
    //   return res.status(400).json({
    //     message:
    //       "A resend link has been recently sent. Please wait for a minute before requesting again.",
    //   });
    // }

    // Generate a verification token
    const token = await new Token({
      userId: savedUser._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    // Construct the verification URL
    const verificationURL = `${process.env.BASE_URL}/users/${savedUser._id}/verify/${token.token}`;

    // Send verification email
    await sendEmail(savedUser.email, "Verify Email", verificationURL);

    // Respond with a message to verify email
    res.status(201).json({
      message:
        "An email has been sent to your account. Please verify your email before logging in.",
    });
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
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if the password is correct
    const validPassword = await user.matchPassword(password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if the user is verified
    if (!user.verified) {
      // If not verified, return a response indicating the need for email verification
      return res.status(400).json({
        message: "Please verify your email before logging in.",
      });
    }

    // If verified, use the logInToken function to create the login token
    const token = signToken(user._id);
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Verify Email
const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
      console.error("Invalid user ID");
      return res.status(400).send({ message: "Invalid link" });
    }

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });

    if (!token) {
      console.error("Invalid token");
      return res.status(400).send({ message: "Invalid link" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { verified: true },
      { new: true }
    );

    if (!updatedUser) {
      console.error("Failed to update user verification status");
      return res.status(500).send({ message: "Internal Server Error" });
    }

    // Check if token is defined before calling remove
    if (token && typeof token.remove === "function") {
      await token.remove();
    } else {
      console.error("Token not found or remove method not available");
    }

    console.log("Email verified successfully");
    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify Email Error:", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
};

// Add this function to your userController.js file
const resendVerificationEmail = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Resend Verification Request for User ID:", id);
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is already verified
    if (user.verified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Check if there's an existing token, and if it's still valid
    const existingToken = await Token.findOne({ userId: user._id });

    if (existingToken && existingToken.createdAt > Date.now() - 60000) {
      return res.status(400).json({
        message:
          "A resend link has been recently sent. Please wait for a minute before requesting again.",
      });
    }

    // Generate a new verification token
    const newToken = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    // Construct the new verification URL
    const verificationURL = `${process.env.BASE_URL}/users/${user._id}/verify/${newToken.token}`;

    // Send the new verification email
    await sendEmail(user.email, "Resend Verification Email", verificationURL);

    res.status(200).json({ message: "Resend link sent successfully" });
  } catch (error) {
    console.error("Resend Verification Email Error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
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
  updateUser,
  deleteUser,
  verifyEmail,
  resendVerificationEmail,
};
