const Place = require("../models/Place");

exports.getAllPlaces = async (req, res, next) => {
  try {
    const { category, city, search, sort, page, limit } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (city) filter.city = city;
    if (search) filter.name = { $regex: search, $options: "i" };

    const currentPage = parseInt(page) || 1;
    const perPage = parseInt(limit) || 10;
    const skip = (currentPage - 1) * perPage;

    let query = Place.find(filter);

    const allowedSorts = ["avgRating", "-avgRating", "priceRange", "-priceRange"];
    if (allowedSorts.includes(sort)) query = query.sort(sort);

    query = query.skip(skip).limit(perPage);

    const [places, total] = await Promise.all([query, Place.countDocuments(filter)]);

    res.json({
      data: places,
      currentPage,
      totalPages: Math.ceil(total / perPage),
      totalItems: total,
      message: "Places retrieved successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getPlace = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({
        error: "Place not found",
        status: 404,
      });
    }
    res.json({ data: place, message: "Place retrieved successfully" });
  } catch (err) {
    next(err);
  }
};

exports.createPlace = async (req, res, next) => {
  try {
    const place = await Place.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ data: place, message: "Place created successfully" });
  } catch (err) {
    next(err);
  }
};

exports.updatePlace = async (req, res, next) => {
  try {
    const place = await Place.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!place) {
      return res.status(404).json({
        error: "Place not found",
        status: 404,
      });
    }
    res.json({ data: place, message: "Place updated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.deletePlace = async (req, res, next) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);
    if (!place) {
      return res.status(404).json({
        error: "Place not found",
        status: 404,
      });
    }
    res.json({ data: null, message: "Place deleted successfully" });
  } catch (err) {
    next(err);
  }
};
