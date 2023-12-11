const Review = require("../models/reviewModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const asyncHandler = require("./../utils/asyncHandler");
const AppError = require("./../utils/appError");
const Comment = require("../models/commentModel");

// get all reviews
const getReviews = asyncHandler(async (req, res, next) => {
  const countReview = await Review.countDocuments();
  const reviews = await Review.find({})
    .populate({
      path: "userId",
      select: "firstName lastName role",
    })
    .populate({
      path: "product",
      select: "name",
    })
    .sort({ createdAt: -1 });

  if (!reviews) {
    return next(new AppError("Can not fetch reviews"));
  }

  res
    .status(200)
    .json({ status: "success", result: countReview, data: { reviews } });
});

// get a single review by ID
const getReview = asyncHandler(async (req, res, next) => {
  const reviewId = req.params.id;

  const review = await Review.findById(reviewId).populate("userId").populate({
    path: "product",
    select: "name",
  });

  if (!review) {
    return next(new AppError("Review not found.", 404));
  }

  res.status(200).json({ status: "success", data: { review } });
});

// create review
const createReview = asyncHandler(async (req, res, next) => {
  const { userId, product, title, description, rating } = req.body;

  // Check if the user has already reviewed the same product
  const existingReview = await Review.findOne({ userId, product });

  if (existingReview) {
    return next(new AppError("You have already reviewed this product.", 400));
  }

  // If no existing review, create a new one
  const review = await Review.create({
    userId,
    product,
    title,
    description,
    rating,
  });

  res.status(201).json(review);
});

// delete review
const deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError(`No review with id ${id}`, 404));
  }

  await Comment.deleteMany({ reviewId: id }); // also delete comment when the review is deleted
  const deletedReview = await Review.findByIdAndDelete(id);

  if (!deletedReview) {
    return next(new AppError(`Review with id ${id} not found`, 404));
  }

  // Respond with a 204 No Content status code
  res.status(204).json();
});

// update review
const updateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { user, product, title, description, rating } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError(`No review with id ${id}`, 404));
  }

  const updatedReview = await Review.findByIdAndUpdate(
    id,
    { user, product, title, description, rating },
    { new: true } // return the updated review
  );

  if (!updatedReview) {
    return next(new AppError(`No review with id ${id}`, 404));
  }

  res.status(200).json(updatedReview);
});

// get reviews by product ID
const getReviewsByProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.id;

  const countReviews = await Review.countDocuments({ product: productId });
  const reviews = await Review.find({ product: productId })
    .populate({
      path: "userId",
      select: "firstName lastName",
    })
    .populate({
      path: "product",
      select: "name",
    })
    .select("title description rating createdAt")
    .sort({ createdAt: -1 });

  // Calculate the average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating =
    countReviews > 0 ? Number((totalRating / countReviews).toFixed(1)) : 0;

  res.status(200).json({
    status: "success",
    result: countReviews,
    data: { reviews, averageRating },
  });
});

module.exports = {
  getReviews,
  createReview,
  deleteReview,
  updateReview,
  getReview,
  getReviewsByProduct,
};
