const express = require("express");
const {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  getReview,
  getReviewsByProduct,
} = require("../controller/reviewController");

const router = express.Router();

// get all reviews
router.get("/", getReviews);

// get a single review
router.get("/:id", getReview);

// get review by product
router.get("/product/:id", getReviewsByProduct);

// create review
router.post("/create-review", createReview);

// update review
router.post("/update-review/:id", updateReview);

// delete review
router.delete("/delete-review/:id", deleteReview);

module.exports = router;
