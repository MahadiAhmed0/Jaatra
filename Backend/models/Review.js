const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 500,
    },
    images: [{ type: String }],
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ place: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
