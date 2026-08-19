const Report = require("../models/Report");
const Review = require("../models/Review");

exports.createReport = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found", status: 404 });
    }

    const existing = await Report.findOne({ review: review._id, user: req.user._id });
    if (existing) {
const message =
        existing.status === "resolved"
          ? "This report has already been reviewed"
          : "Review already reported";
      return res.json({ data: existing, message, alreadyReported: true });
    }

    const report = await Report.create({
      review: review._id,
      user: req.user._id,
      reason: req.body.reason,
    });

    res.status(201).json({ data: report, message: "Report submitted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const reports = await Report.find(filter)
      .populate("review", "rating comment place deleted")
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ data: reports, message: "Reports retrieved successfully" });
  } catch (err) {
    next(err);
  }
};

exports.updateReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!report) {
      return res.status(404).json({ error: "Report not found", status: 404 });
    }
    res.json({ data: report, message: "Report updated successfully" });
  } catch (err) {
    next(err);
  }
};
