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

router.route("/").get(getReviews).post(createReview);

router
  .route("/:id")
  .get(getReview)
  .post(updateReview)
  .delete(deleteReview);

router.get("/product/:id", getReviewsByProduct);

module.exports = router;
