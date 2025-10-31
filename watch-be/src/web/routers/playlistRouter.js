const express = require('express');
const router = express.Router();
const PlaylistController = require('../controller/playlistController');

router.get("/all", PlaylistController.getAll); // tất cả playlist hệ thống
router.get("/user/:id", PlaylistController.getByUser); // tất cả playlist theo user
router.get("/:id", PlaylistController.getById); // lấy playlist theo playlistId
router.post("/", PlaylistController.create);
router.put("/:id", PlaylistController.update);
router.delete("/:id", PlaylistController.delete);
router.post("/add-song", PlaylistController.addSong);
router.post("/remove-song", PlaylistController.removeSong);
router.get("/:id/songs", PlaylistController.getSongs);

module.exports = router;
