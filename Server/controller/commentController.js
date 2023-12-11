const Comment = require("../models/commentModel");
const asyncHandler = require("./../utils/asyncHandler");
const AppError = require("./../utils/appError");

// Get all comments on one specific review
const getComments = asyncHandler(async (req, res, next) => {
  const reviewId = req.params.reviewId;
  const comments = await Comment.find({ reviewId: reviewId })
    .populate("userId")
    .populate({
      path: "reviewId",
      select: "title",
    })
    .sort({ createdAt: -1 });

  if (!comments) {
    return next(new AppError("Cannot fetch comments"));
  }

  res
    .status(200)
    .json({ status: "success", result: comments.length, data: { comments } });
});

// Create a comment
const createComment = asyncHandler(async (req, res, next) => {
  const { userId, reviewId, commentText, replies } = req.body;

  // If no existing review, create a new one
  const comment = await Comment.create({
    userId,
    reviewId,
    commentText,
    replies,
  });

  res.status(201).json({
    status: "success",
    data: { comment },
  });
});

// Update a comment
const updateComment = asyncHandler(async (req, res, next) => {
  const commentId = req.params.commentId; 
  const { commentText, replies } = req.body;

  // Find the comment by its ID and update it
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { commentText, replies },
    { new: true, runValidators: true }
  );

  if (!updatedComment) {
    return next(new AppError("Comment not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { updatedComment },
  });
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res, next) => {
  const commentId = req.params.commentId; // Change parameter name to commentId

  // Find the comment by its ID and remove it
  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if (!deletedComment) {
    return next(new AppError("Comment not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { deletedComment },
  });
});

module.exports = { getComments, createComment, updateComment, deleteComment };