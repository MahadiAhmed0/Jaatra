const errorHandler = (err, req, res, next) => {
  if (err.name === "MulterError" || err.status === 400) {
    return res.status(400).json({
      error: err.message,
      status: 400,
    });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: "Validation failed",
      details: messages,
      status: 400,
    });
  }

  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      error: "Invalid ID format",
      status: 400,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || "value";
    return res.status(409).json({
      error: `${field} already exists`,
      status: 409,
    });
  }

  console.error(err.stack);
  res.status(500).json({
    error: "Internal server error",
    status: 500,
  });
};

module.exports = errorHandler;
