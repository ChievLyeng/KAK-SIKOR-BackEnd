const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  userId: { type: String, required: true },
  accessToken: { type: String },
  refreshToken: { type: String },
  createdAt: { type: String, default: new Date().toLocaleString() },
});

const SessionToken = mongoose.model("SessionToken", sessionSchema);

module.exports = SessionToken;
