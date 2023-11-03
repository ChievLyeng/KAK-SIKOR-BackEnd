const Review = require("../models/reviewModel");
const mongoose = require("mongoose");

// gets all review
const getReviews = async (req, res) => {
  const reviews = await Review.find({}).sort({ createdAt: -1 });

  res.status(200).json(reviews);
};

// create reviews
const createReview = async (req, res) => {
  const { user, product, description, rating } = req.body;
  try {
    const review = await Review.create({ user, product, description, rating });
    res.status(200).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getReviews, createReview };
