const mongoose = require("mongoose");
const User = require("./userModel");

const supplierSchema = User.discriminator(
  "Supplier",
  new mongoose.Schema({
    farmName: {
      type: String,
    },
    products: {
      type: [String],
      required: [true, "Products are required."],
    },
    harvestSchedule: {
      type: Date,
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    supplierStatus: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },
  })
);

const Supplier = mongoose.model("Supplier", supplierSchema.schema);
module.exports = Supplier;
