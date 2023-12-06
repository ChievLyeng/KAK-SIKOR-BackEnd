const Review = require("../models/reviewModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const asyncHandler = require("./../utils/asyncHandler");
const AppError = require('./../utils/appError')

// get all reviews
const getReviews = asyncHandler( async (req, res,next) => {

  const countReview = await Review.countDocuments();
  const reviews = await Review.find({})
    // get only name from user model
    .populate("userId")
    .populate({
      path: "product",
      select: "name",
    })
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json({ status: "success", result: countReview, data: { reviews } });
});

// get a single review by ID
const getReview = asyncHandler( async (req,res,next) => {
  const reviewId = req.params.id;


    const review = await Review.findById(reviewId).populate("userId").populate({
      path: "product",
      select: "name",
    });

    if (!review) {
      return next(new AppError('Review not found.',404))
    }

    res.status(200).json({ status: "success", data: { review } });
});

// create review
const createReview = asyncHandler( async (req,res,next) => {
  const { userId, product, description, rating } = req.body;

 
    // Check if the user has the role "user"
    if (req.body.role !== "user") {
      return next(new AppError('Permission denied. Only users with the "user" role can create reviews.',403));
    }

    const review = await Review.create({
      userId,
      product,
      description,
      rating,
    });

    res.status(200).json(review);
});

// delete review
const deleteReview = asyncHandler( async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError(`No review with id ${id}`,404))
    }

    res.status(200).json({ message: "Review deleted successfully" });
});

// update review
const updateReview = asyncHandler( async (req, res, next) => {
  const { id } = req.params;
  const { user, product, description, rating } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError(`No review with id ${id}`,404))
  }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { user, product, description, rating },
      { new: true } // return the updated review
    );

    if (!updatedReview) {
      return next(new AppError(`No review with id ${id}`,404))
    }

    res.status(200).json(updatedReview);
});

// get reviews by product ID
const getReviewsByProduct = asyncHandler( async (req, res, next) => {
  const productId = req.params.id;

    const countReviews = await Review.countDocuments({ product: productId });
    const review = await Review.find({ product: productId })
      .populate("userId")
      .populate({
        path: "product",
        select: "name",
      })
      .select("description rating")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ status: "success", result: countReviews, data: { review } });
});

module.exports = {
  getReviews,
  createReview,
  deleteReview,
  updateReview,
  getReview,
  getReviewsByProduct,
};
