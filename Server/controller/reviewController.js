const Review = require("../models/reviewModel");
const mongoose = require("mongoose");

// gets all review
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("userId")
      .populate("product")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Error fetching reviews" });
  }
};

// create reviews
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

// delete reviews
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

module.exports = { getReviews, createReview, deleteReview, updateReview };
