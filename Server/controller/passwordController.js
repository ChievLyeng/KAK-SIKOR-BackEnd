const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const resetPassword = require("../utils/resetPasswordEmail");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

// @desc    Handle forgot password request
// @route   POST /api/v1/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  await resetPassword(
    email,
    "Password Reset Code",
    `You have requested to reset your password. Please use the verification code provided below to proceed with the password reset.`
  );

  res.status(200).json({ message: "OTP sent successfully" });
});

// @desc    Handle OTP verification
// @route   POST /api/v1/users/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res, next) => {
  const { userOTP } = req.body;

  // Retrieve the latest OTP record for any user (you may need to adjust this logic)
  const latestOtp = await Otp.findOne().sort({ createdAt: -1 });

  if (!latestOtp) {
    return next(new AppError("OTP not found", 404));
  }

  if (userOTP === latestOtp.otp) {
    return res.status(200).json({ message: "OTP verified successfully" });
  } else {
    return next(new AppError("Invalid OTP", 401));
  }
});

// @desc    Handle password reset
// @route   POST /api/v1/users/reset-password
// @access  Public
const resetNewPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.password = newPassword;
  await user.save();

  await Otp.deleteMany({ email });

  res.status(200).json({ message: "Password reset successfully" });
});

// @desc    Handle password update
// @route   PUT /api/v1/users/update-password/:id
// @access  Private (requires authentication)
const updatePassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const validPassword = await user.matchPassword(currentPassword);
  if (!validPassword) {
    return next(new AppError("Current password is incorrect", 401));
  }

  if (user.passwordHistory.length === 0) {
    if (currentPassword === newPassword) {
      return next(
        new AppError(
          "New password must be different from the current password",
          400
        )
      );
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

      return next(
        new AppError(
          `Cannot use the same old password as the one created ${durationMessage} ago`,
          400
        )
      );
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
});

module.exports = {
  forgotPassword,
  verifyOTP,
  resetNewPassword,
  updatePassword,
};
