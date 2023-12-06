const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const resetPassword = require("../utils/resetPasswordEmail");

// Change the email content to include only OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user based on email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send email with the OTP
    await resetPassword(
      email,
      "Password Reset Code",
      `You have requested to reset your password. Please use the verification code provided below to proceed with the password reset.`
    );

    // Respond with a success message
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, userOTP } = req.body;

    // Find the user based on email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find all OTP records based on email and sort by creation timestamp in descending order
    const otpRecords = await Otp.find({ email }).sort({ createdAt: -1 });

    if (otpRecords.length === 0) {
      return res.status(404).json({ error: "OTP not found" });
    }

    // Use the last record, which is the latest one due to sorting
    const latestOtp = otpRecords[otpRecords.length - 1];

    // Check if the provided OTP matches the latest stored OTP
    if (userOTP === latestOtp.otp) {
      // OTP is valid, you can perform the password reset logic here

      // For example, redirect to the password reset page
      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      // Invalid OTP
      return res.status(401).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const resetNewPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Check if the passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Update the user's password in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    // Clear all OTP records associated with the user
    await Otp.deleteMany({ email });

    // Respond with a success message
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the current password matches
    const validPassword = await user.matchPassword(currentPassword);
    if (!validPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Check if it's the first time changing the password
    if (user.passwordHistory.length === 0) {
      // Ensure the new password is different from the current password
      if (currentPassword === newPassword) {
        return res.status(400).json({
          error: "New password must be different from the current password",
        });
      }
    } else {
      // Check if the new password is the same as any previous password
      const matchingEntry = user.passwordHistory.find(
        (entry) => entry.password === newPassword && entry.timestamp
      );

      if (matchingEntry) {
        const entryTimestamp = new Date(matchingEntry.timestamp);
        const currentTimestamp = new Date();

        // Calculate the time difference in milliseconds
        const timeDifference = currentTimestamp - entryTimestamp;

        // Calculate the duration in days, hours, and minutes
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
        );

        let durationMessage = "";

        // Build the dynamic duration message
        if (days > 0) {
          durationMessage += `${days} day${days > 1 ? "s" : ""}`;
        } else if (hours > 0) {
          durationMessage += `${hours} hour${hours > 1 ? "s" : ""}`;
        } else {
          durationMessage += `${minutes} minute${minutes > 1 ? "s" : ""}`;
        }

        return res.status(400).json({
          error: `Cannot use the same old password as the one created ${durationMessage} ago`,
        });
      }
    }

    // Update the password
    user.password = newPassword;

    // Update the passwordChangedAt field
    user.passwordChangedAt = Date.now();

    // Add the entry to password history
    const timestamp = new Date().toLocaleString();
    user.passwordHistory.push({
      password: newPassword,
      timestamp,
    });

    // Save the user
    await user.save();

    // Respond with a success message
    res.status(200).json({
      message: `Password updated successfully at ${timestamp}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  forgotPassword,
  verifyOTP,
  resetNewPassword,
  updatePassword,
};
