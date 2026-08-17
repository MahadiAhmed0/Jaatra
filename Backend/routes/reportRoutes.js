const express = require("express");
const { protect, restrictTo } = require("../middleware/auth");
const reportController = require("../controllers/reportController");

const nestedRouter = express.Router({ mergeParams: true });
nestedRouter.post("/", protect, reportController.createReport);

const flatRouter = express.Router();
flatRouter.get("/", protect, restrictTo("admin"), reportController.getReports);
flatRouter.patch("/:id", protect, restrictTo("admin"), reportController.updateReport);

module.exports = { nestedRouter, flatRouter };
