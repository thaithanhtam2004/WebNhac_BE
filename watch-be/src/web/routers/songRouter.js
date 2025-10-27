// routes/song.js
const express = require("express");
const router = express.Router();
const SongController = require("../controller/songController");
const upload = require("../middlewares/upload");

router.post(
  "/",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover", maxCount: 1 }
  ]),
  SongController.create
);

router.put(
  "/:id",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover", maxCount: 1 }
  ]),
  SongController.update
);

router.get("/search/all", SongController.searchAll); 
router.get("/all/latest", SongController.getSongByReleaseDate); 
router.get("/singer/:singerId", SongController.getBySinger); 
router.get("/genre/:genreId", SongController.getByGenre); 

router.get("/", SongController.getAll);
router.get("/:id", SongController.getById); 
router.delete("/:id", SongController.delete);
router.post("/:id/view", SongController.increaseView);

module.exports = router;