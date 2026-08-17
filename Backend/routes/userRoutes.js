const express = require("express");
const { protect } = require("../middleware/auth");
const userController = require("../controllers/userController");

const router = express.Router();

router.use(protect);

router.get("/me", userController.getMe);
router.patch("/me", userController.updateMe);
router.get("/me/wishlist", userController.getWishlist);
router.post("/me/wishlist/:placeId", userController.addToWishlist);
router.delete("/me/wishlist/:placeId", userController.removeFromWishlist);

module.exports = router;
