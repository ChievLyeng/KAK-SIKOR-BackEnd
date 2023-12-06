const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const resetPassword = require("../utils/resetPasswordEmail");
const asyncHandler = require("../utils/asyncHandler");

const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await resetPassword(
      email,
      "Password Reset Code",
      `You have requested to reset your password. Please use the verification code provided below to proceed with the password reset.`
    );

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  try {
    const { email, userOTP } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otpRecords = await Otp.find({ email }).sort({ createdAt: -1 });

    if (otpRecords.length === 0) {
      return res.status(404).json({ error: "OTP not found" });
    }

    const latestOtp = otpRecords[otpRecords.length - 1];

    if (userOTP === latestOtp.otp) {
      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      return res.status(401).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const resetNewPassword = asyncHandler(async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    await Otp.deleteMany({ email });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const validPassword = await user.matchPassword(currentPassword);
    if (!validPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    if (user.passwordHistory.length === 0) {
      if (currentPassword === newPassword) {
        return res.status(400).json({
          error: "New password must be different from the current password",
        });
      }
    } else {
      const matchingEntry = user.passwordHistory.find(
        (entry) => entry.password === newPassword && entry.timestamp
      );

      if (matchingEntry) {
        const entryTimestamp = new Date(matchingEntry.timestamp);
        const currentTimestamp = new Date();
        const timeDifference = currentTimestamp - entryTimestamp;
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
        );

        let durationMessage = "";

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

    user.password = newPassword;
    user.passwordChangedAt = Date.now();

    const timestamp = new Date().toLocaleString();
    user.passwordHistory.push({
      password: newPassword,
      timestamp,
    });

    await user.save();

    res.status(200).json({
      message: `Password updated successfully at ${timestamp}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  forgotPassword,
  verifyOTP,
  resetNewPassword,
  updatePassword,
};
