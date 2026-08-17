const express = require("express");
const { protect } = require("../middleware/auth");
const reviewController = require("../controllers/reviewController");

const nestedRouter = express.Router({ mergeParams: true });
nestedRouter.get("/", reviewController.getReviews);
nestedRouter.post("/", protect, reviewController.createReview);

const flatRouter = express.Router();
flatRouter.patch("/:id", protect, reviewController.updateReview);
flatRouter.delete("/:id", protect, reviewController.deleteReview);
flatRouter.patch("/:id/helpful", protect, reviewController.markHelpful);

module.exports = { nestedRouter, flatRouter };
