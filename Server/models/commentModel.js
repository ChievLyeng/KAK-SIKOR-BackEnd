const mongoose = require("mongoose");

const { Schema } = mongoose;

const replySchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  commentId: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
    required: true,
  },
  replyText: {
    type: String,
    required: true,
  },
});

const commentSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviewId: {
    type: Schema.Types.ObjectId,
    ref: "Review",
    required: true,
  },
  commentText: {
    type: String,
    trim: true,
    minlength: 1,
    maxlength: 280,
    required: [true, "Please add a comment"],
  },
  replies: [replySchema],
});

// Set up a middleware to remove associated replies when a comment is deleted
commentSchema.pre("remove", async function (next) {
  const Reply = require("");
  await Reply.deleteMany({ commentId: this._id });
  next();
});

module.exports = mongoose.model("Comment", commentSchema);
