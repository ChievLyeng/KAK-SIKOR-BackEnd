const Review = require("../models/reviewModel");
const mongoose = require("mongoose");

// get all reviews
const getReviews = async (req, res) => {
  try {
    const countReview = await Review.countDocuments();
    const reviews = await Review.find({})
      // get only name from user model
      .populate({
        path: "userId",
        select: ("firstName", "lastName"),
      })
      .populate({
        path: "product",
        select: "name",
      })
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ status: "success", result: countReview, data: { reviews } });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Error fetching reviews" });
  }
};

// get a single review by ID
const getReview = async (req, res) => {
  const reviewId = req.params.id;

  try {
    const review = await Review.findById(reviewId)
      .populate({
        path: "userId",
        select: ("firstName", "lastName"),
      })
      .populate({
        path: "product",
        select: "name",
      });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.status(200).json({ status: "success", data: { review } });
  } catch (error) {
    console.error("Error fetching review by ID:", error);
    res.status(500).json({ error: "Error fetching review by ID" });
  }
};

// create review
const createReview = async (req, res) => {
  const { userId, product, description, rating } = req.body;

  try {
    const review = await Review.create({
      userId,
      product,
      description,
      rating,
    });

    res.status(200).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete review
const deleteReview = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: `No review with id ${id}` });
  }

  try {
    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview) {
      return res.status(404).json({ error: `No review with id ${id}` });
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while deleting the review" });
  }
};

// update review

const updateReview = async (req, res) => {
  const { id } = req.params;
  const { user, product, description, rating } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: `No review with id ${id}` });
  }

  try {
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { user, product, description, rating },
      { new: true } // return the updated review
    );

    if (!updatedReview) {
      return res.status(404).json({ error: `No review with id ${id}` });
    }

    res.status(200).json(updatedReview);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the review" });
  }
};

module.exports = {
  getReviews,
  createReview,
  deleteReview,
  updateReview,
  getReview,
};
