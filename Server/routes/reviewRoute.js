const express = require("express");
const { createReview, getReviews } = require("../controller/reviewController");

const router = express.Router();

router.get("/", getReviews);

router.post("/create-review", createReview);

module.exports = router;
