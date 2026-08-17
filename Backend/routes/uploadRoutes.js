const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/auth");
const { uploadImage } = require("../controllers/uploadController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    const err = new Error("Only image files are allowed");
    err.status = 400;
    cb(err);
  },
});

const router = express.Router();

router.post("/", protect, upload.single("image"), uploadImage);

module.exports = router;
