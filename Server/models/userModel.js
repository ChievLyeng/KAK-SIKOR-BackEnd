const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required."],
      trim: true,
      maxlength: [30, "First name cannot exceed 30 characters."],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required."],
      trim: true,
      maxlength: [30, "Last name cannot exceed 30 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      trim: true,
      maxlength: [255, "Email cannot exceed 255 characters."],
      validate: {
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "Invalid email format.",
      },
    },
    phoneNumber: {
      type: Number,
      required: [true, "Phone number is required."],
      unique: true,
      validate: {
        validator: function (value) {
          return /^\d+$/.test(value);
        },
        message: "Phone number can only contain numeric characters.",
      },
    },
    birthDate: {
      type: Date,
      required: [true, "Birthdate is required."],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Gender is required."],
    },
    address: {
      city: {
        type: String,
        trim: true,
      },
      commune: {
        type: String,
        trim: true,
      },
      district: {
        type: String,
        trim: true,
      },
      village: {
        type: String,
        trim: true,
      },
      homeNumber: {
        type: Number,
        trim: true,
      },
      street: {
        type: String,
        trim: true,
      },
    },
    profilePicture: String,
    role: {
      type: String,
      enum: ["user", "supplier", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: (value) => {
          return validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          });
        },
        message: "Password must be strong and secure",
      },
    },
    confirmPassword: {
      type: String,
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Passwords do not match.",
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    passwordChangedAt: { type: Date },
    passwordHistory: [
      {
        password: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.confirmPassword = undefined;

  // Update passwordChangedAt
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// Define a method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
