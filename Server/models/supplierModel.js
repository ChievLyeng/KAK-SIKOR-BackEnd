const mongoose = require("mongoose");
const User = require("./userModel");

const supplierSchema = User.discriminator("Supplier", new mongoose.Schema({}));

module.exports = mongoose.model("Supplier", supplierSchema);
