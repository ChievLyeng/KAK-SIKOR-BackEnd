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

router.get("/reviews", getReviews)
.get("/:id", getReview)
.get("/:id", getReviewsByProduct)
.post("/", createReview)
.post("/:id", updateReview)
.delete("/:id", deleteReview)


module.exports = router;
