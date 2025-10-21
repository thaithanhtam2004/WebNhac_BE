const express = require("express");
const router = express.Router();
const FavoriteController = require("../controller/favoriteController");

router.get("/:userId", FavoriteController.getUserFavorites); // Lấy danh sách yêu thích
router.post("/", FavoriteController.addFavorite);             // Thêm yêu thích
router.delete("/", FavoriteController.removeFavorite);        // Bỏ yêu thích

module.exports = router;
