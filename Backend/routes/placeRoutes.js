const express = require("express");
const { protect, restrictTo } = require("../middleware/auth");
const placeController = require("../controllers/placeController");

const router = express.Router();

router.get("/", placeController.getAllPlaces);
router.get("/:id", placeController.getPlace);
router.post("/", protect, restrictTo("admin"), placeController.createPlace);
router.put("/:id", protect, restrictTo("admin"), placeController.updatePlace);
router.delete("/:id", protect, restrictTo("admin"), placeController.deletePlace);

module.exports = router;
