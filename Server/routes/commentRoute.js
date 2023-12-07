const express = require("express");
const router = express.Router();
const {
  createComment,
  getComments,
  deleteComment,
  updateComment,
} = require("../controller/commentController");

// routes
router.route("/:reviewId/").post(createComment).get(getComments);

router.route("/:commentId").put(updateComment).delete(deleteComment);

module.exports = router;comment