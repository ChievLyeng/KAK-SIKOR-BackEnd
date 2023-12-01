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

router.route("/reviews").get(getReviews).post(createReview);

router
  .route("/review/:id")
  .get(getReview)
  .post(updateReview)
  .delete(deleteReview);

router.get("/reviews/product/:id", getReviewsByProduct);

module.exports = router;
