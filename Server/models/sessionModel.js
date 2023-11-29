const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  userId: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const SessionToken = mongoose.model("SessionToken", sessionSchema);

module.exports = SessionToken;
