const Review = require("../models/Review");
const Place = require("../models/Place");
const Report = require("../models/Report");

const recalcPlaceRating = async (placeId) => {
  const stats = await Review.aggregate([
    { $match: { place: placeId } },
    {
      $group: {
        _id: "$place",
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length === 0) {
    await Place.findByIdAndUpdate(placeId, { avgRating: 0, reviewCount: 0 });
  } else {
    await Place.findByIdAndUpdate(placeId, {
      avgRating: stats[0].avgRating,
      reviewCount: stats[0].reviewCount,
    });
  }
};

exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ place: req.params.placeId }).populate("user", "name");
    res.json({ data: reviews, message: "Reviews retrieved successfully" });
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const review = await Review.create({
      place: req.params.placeId,
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
      images: req.body.images || [],
    });

    await recalcPlaceRating(review.place);

    res.status(201).json({ data: review, message: "Review created successfully" });
  } catch (err) {
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found", status: 404 });
    }

    if (!review.user.equals(req.user._id)) {
      return res.status(403).json({
        error: "You can only update your own review",
        status: 403,
      });
    }

    if (req.body.rating !== undefined) review.rating = req.body.rating;
    if (req.body.comment !== undefined) review.comment = req.body.comment;
    if (req.body.images !== undefined) review.images = req.body.images;

    await review.save();
    await recalcPlaceRating(review.place);

    res.json({ data: review, message: "Review updated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found", status: 404 });
    }

    const isOwner = review.user.equals(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "You do not have permission to delete this review",
        status: 403,
      });
    }

    const placeId = review.place;
    await review.deleteOne();
    await Report.deleteMany({ review: review._id });
    await recalcPlaceRating(placeId);

    res.json({ data: null, message: "Review deleted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ error: "Review not found", status: 404 });
    }
    res.json({ data: review, message: "Review marked helpful" });
  } catch (err) {
    next(err);
  }
};
